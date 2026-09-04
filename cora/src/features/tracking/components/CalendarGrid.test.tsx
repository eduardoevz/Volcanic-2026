import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '@/ui/theme/ThemeContext';

import { CalendarGrid } from './CalendarGrid';

function renderGrid(overrides: Partial<React.ComponentProps<typeof CalendarGrid>> = {}) {
  const onDayPress = jest.fn();
  const props: React.ComponentProps<typeof CalendarGrid> = {
    year: 2026,
    month: 0, // enero, 0-indexed
    bleedingDates: new Set(['2026-01-05']),
    loggedDates: new Set(['2026-01-05', '2026-01-06']),
    predictedRange: null,
    fertileRange: null,
    sexualActivityDates: new Set(),
    ovulationDate: null,
    onDayPress,
    ...overrides,
  };
  return render(<ThemeProvider><CalendarGrid {...props} /></ThemeProvider>).then((result) => ({
    onDayPress,
    ...result,
  }));
}

describe('CalendarGrid', () => {
  it('renderiza los 7 encabezados de día de la semana', async () => {
    const { getAllByText } = await renderGrid();
    // eachDayOfInterval de lunes a domingo, formateado 'EEEEEE' en es (2 letras)
    const headers = getAllByText(/^[a-záéíóúñ]{1,3}\.?$/i);
    expect(headers.length).toBeGreaterThanOrEqual(7);
  });

  it('renderiza los 31 días de enero 2026 dentro del grid, incluyendo días de meses vecinos para completar semanas', async () => {
    const { getAllByText } = await renderGrid();
    // "1" aparece dos veces: el 1 de enero y el 1 de febrero (día de relleno de la semana siguiente)
    expect(getAllByText('1').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('31').length).toBeGreaterThanOrEqual(1);
  });

  it('llama a onDayPress con la fecha ISO correcta al tocar un día', async () => {
    const { getByText, onDayPress } = await renderGrid();
    fireEvent.press(getByText('15'));
    expect(onDayPress).toHaveBeenCalledWith('2026-01-15');
  });

  it('con bleedingDates y loggedDates vacíos no revienta (caso límite: mes sin ningún registro)', async () => {
    const { getAllByText } = await renderGrid({ bleedingDates: new Set(), loggedDates: new Set() });
    expect(getAllByText('1').length).toBeGreaterThanOrEqual(1);
  });
});
