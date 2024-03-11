export interface Alert {
  severity: 'Moderate' | 'Severe' | 'Extreme';
  headline: string;
  instruction: string;
}
