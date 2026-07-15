export const PERIOD_OPTIONS = [
  {
    label: 'Theo tháng',
    value: '1m',
    unitLabel: 'tháng',
    hint: '1 mốc = 1 tháng',
  },
  {
    label: 'Theo quý',
    value: '1q',
    unitLabel: 'quý',
    hint: '1 mốc = 1 quý',
  },
  {
    label: 'Theo 6 tháng',
    value: '6m',
    unitLabel: '6 tháng',
    hint: '1 mốc = 6 tháng',
  },
  {
    label: 'Theo năm',
    value: '1y',
    unitLabel: 'năm',
    hint: '1 mốc = 1 năm',
  },
];

export const getPeriodOption = (value) =>
  PERIOD_OPTIONS.find((item) => item.value === value) || PERIOD_OPTIONS[0];

export const getPeriodUnitLabel = (value) => getPeriodOption(value).unitLabel;
