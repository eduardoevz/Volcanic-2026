import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import aesjs from 'aes-js';

// El decodificador `aesjs.utils.utf8.fromBytes` de la librería no soporta
// secuencias UTF-8 de 4 bytes (emoji, caracteres fuera del BMP): a partir del
// primer emoji en el texto (frecuentes en esta app — mascota, íconos de
// biblioteca) desalinea la lectura de bytes y corrompe todo lo que sigue.
// `toBytes` sí es correcto (usa `encodeURI` internamente), así que solo se
// reemplaza la mitad de decodificación por una implementación completa.
function utf8BytesToString(bytes: Uint8Array): string {
  let result = '';
  let i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i];
    if (b0 < 0x80) {
      result += String.fromCharCode(b0);
      i += 1;
    } else if ((b0 & 0xe0) === 0xc0) {
      const b1 = bytes[i + 1];
      result += String.fromCharCode(((b0 & 0x1f) << 6) | (b1 & 0x3f));
      i += 2;
    } else if ((b0 & 0xf0) === 0xe0) {
      const b1 = bytes[i + 1];
      const b2 = bytes[i + 2];
      result += String.fromCharCode(((b0 & 0x0f) << 12) | ((b1 & 0x3f) << 6) | (b2 & 0x3f));
      i += 3;
    } else {
      const b1 = bytes[i + 1];
      const b2 = bytes[i + 2];
      const b3 = bytes[i + 3];
      const codePoint =
        (((b0 & 0x07) << 18) | ((b1 & 0x3f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f)) - 0x10000;
      result += String.fromCharCode(0xd800 + (codePoint >> 10), 0xdc00 + (codePoint & 0x3ff));
      i += 4;
    }
  }
  return result;
}

// expo-secure-store tiene un límite de ~2KB por valor en Android — insuficiente
// para un JWT + refresh token de Supabase, y muy insuficiente para la caché de
// React Query. Este wrapper sigue el patrón oficial de Supabase para React
// Native ("LargeSecureStore"): la clave AES-256 (dato chico) vive en
// SecureStore, protegida por el keystore de Android; el valor cifrado (de
// cualquier tamaño) vive en AsyncStorage. Un `namespace` por instancia evita
// que las claves de auth y las de la caché de queries choquen entre sí.
export class LargeSecureStore {
  // Memoiza la promesa de creación de clave y encadena las escrituras por
  // `key`: sin esto, dos `setItem` concurrentes sobre la misma key (frecuente
  // con el persister de React Query, que puede disparar varias escrituras
  // casi simultáneas) pueden generar cada uno una clave AES distinta y pisarse
  // el uno al otro entre SecureStore y AsyncStorage, dejando un par
  // clave/texto-cifrado inconsistente que ya no descifra.
  private readonly keyPromises = new Map<string, Promise<Uint8Array>>();
  private readonly writeQueues = new Map<string, Promise<void>>();

  constructor(private readonly namespace: string) {}

  private keyStorageKey(key: string): string {
    return `${this.namespace}_key_${key}`;
  }

  private getOrCreateEncryptionKey(key: string): Promise<Uint8Array> {
    const cached = this.keyPromises.get(key);
    if (cached) return cached;

    const promise = (async () => {
      const storageKey = this.keyStorageKey(key);
      const existing = await SecureStore.getItemAsync(storageKey);
      if (existing) {
        return aesjs.utils.hex.toBytes(existing);
      }

      const newKey = crypto.getRandomValues(new Uint8Array(32));
      await SecureStore.setItemAsync(storageKey, aesjs.utils.hex.fromBytes(newKey));
      return newKey;
    })();

    this.keyPromises.set(key, promise);
    return promise;
  }

  async getItem(key: string): Promise<string | null> {
    const [encryptionKeyHex, encrypted] = await Promise.all([
      SecureStore.getItemAsync(this.keyStorageKey(key)),
      AsyncStorage.getItem(key),
    ]);
    if (!encryptionKeyHex || !encrypted) return null;

    const encryptionKey = aesjs.utils.hex.toBytes(encryptionKeyHex);
    const combined = aesjs.utils.hex.toBytes(encrypted);
    const iv = combined.slice(0, 16);
    const ciphertext = combined.slice(16);

    const aesCtr = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(iv));
    const decryptedBytes = aesCtr.decrypt(ciphertext);
    return utf8BytesToString(decryptedBytes);
  }

  async setItem(key: string, value: string): Promise<void> {
    const previous = this.writeQueues.get(key) ?? Promise.resolve();
    const next = previous
      .catch(() => undefined)
      .then(async () => {
        const encryptionKey = await this.getOrCreateEncryptionKey(key);
        const iv = crypto.getRandomValues(new Uint8Array(16));

        const aesCtr = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(iv));
        const encryptedBytes = aesCtr.encrypt(aesjs.utils.utf8.toBytes(value));

        const combined = new Uint8Array(iv.length + encryptedBytes.length);
        combined.set(iv, 0);
        combined.set(encryptedBytes, iv.length);

        await AsyncStorage.setItem(key, aesjs.utils.hex.fromBytes(combined));
      });

    this.writeQueues.set(key, next);
    return next;
  }

  async removeItem(key: string): Promise<void> {
    this.keyPromises.delete(key);
    await Promise.all([
      SecureStore.deleteItemAsync(this.keyStorageKey(key)),
      AsyncStorage.removeItem(key),
    ]);
  }
}
