jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// React 19 requiere que el entorno de test se declare explícitamente como
// compatible con `act()` — sin esto, React emite warnings de "act
// environment not configured" y las actualizaciones async de RHF/zod
// pueden filtrarse de un test a otro en @testing-library/react-native 14.
global.IS_REACT_ACT_ENVIRONMENT = true;
