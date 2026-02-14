/** Turn "#4A90D9" into "rgba(74,144,217,0.12)" */
export function toFadedBg(hex: string, opacity = 0.12): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}
