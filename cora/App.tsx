import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';

export default function App() {
  const [supabaseStatus, setSupabaseStatus] = useState('Conectando...');

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(() => setSupabaseStatus('Cliente de Supabase conectado'))
      .catch((error) => setSupabaseStatus(`Error de conexión: ${error.message}`));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cora</Text>
      <Text>{supabaseStatus}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C2185B',
  },
});
