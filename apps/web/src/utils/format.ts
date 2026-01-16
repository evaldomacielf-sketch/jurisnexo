export const formatCurrency = (value: number, currency = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};
