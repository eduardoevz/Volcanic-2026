import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import {
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  Chip,
  EmptyState,
  Input,
  Screen,
  Sheet,
  Skeleton,
  Text,
} from '@/ui/components';
import { spacing } from '@/ui/theme/tokens';

export default function KitchenSink() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [chipSelected, setChipSelected] = useState(false);
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Error de prueba disparado desde Kitchen Sink');
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
        <Text variant="title">Kitchen Sink</Text>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">Text</Text>
          <Text variant="title">Title</Text>
          <Text variant="heading">Heading</Text>
          <Text variant="body">Body</Text>
          <Text variant="bodyMuted">Body muted</Text>
          <Text variant="caption">Caption</Text>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">Button</Text>
          <Button label="Primary" onPress={() => {}} />
          <Button label="Secondary" variant="secondary" onPress={() => {}} />
          <Button label="Ghost" variant="ghost" onPress={() => {}} />
          <Button label="Loading" loading onPress={() => {}} />
          <Button label="Disabled" disabled onPress={() => {}} />
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">Input</Text>
          <Input label="Correo" placeholder="vos@correo.com" />
          <Input label="Con error" placeholder="..." error="Este campo es obligatorio" />
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">Card</Text>
          <Card>
            <Text variant="body">Contenido dentro de una Card.</Text>
          </Card>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">Chip</Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            <Chip label="Sin seleccionar" selected={false} onPress={() => setChipSelected(false)} />
            <Chip label="Seleccionado" selected={chipSelected} onPress={() => setChipSelected(true)} />
          </View>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">Badge</Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            <Badge label="Neutral" tone="neutral" />
            <Badge label="Éxito" tone="success" />
            <Badge label="Aviso" tone="warning" />
            <Badge label="Peligro" tone="danger" />
          </View>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">Avatar</Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
            <Avatar initials="CR" />
            <Avatar initials="AB" size={64} />
          </View>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">Banner</Text>
          <Banner message="Cora no diagnostica ni sustituye atención médica." tone="info" />
          <Banner message="Revisá tu conexión a internet." tone="warning" />
          <Banner message="No se pudo guardar el registro." tone="danger" />
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">Skeleton</Text>
          <Skeleton height={16} width="80%" />
          <Skeleton height={16} width="60%" />
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">EmptyState</Text>
          <EmptyState
            title="Todavía no hay registros"
            description="Registrá tu día para empezar a ver tu historial."
            actionLabel="Registrar"
            onAction={() => {}}
          />
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">Sheet</Text>
          <Button label="Abrir Sheet" variant="secondary" onPress={() => setSheetOpen(true)} />
          <Sheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
            <Text variant="heading">Contenido del Sheet</Text>
            <Button label="Cerrar" onPress={() => setSheetOpen(false)} />
          </Sheet>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="heading">ErrorBoundary</Text>
          <Button
            label="Lanzar error de prueba"
            variant="ghost"
            onPress={() => setShouldThrow(true)}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
