export function parseInt(
  value: string | number | undefined,
  def: number
): number;
export function parseInt(value?: string | number, def?: number) {
  if (value === undefined) return def;
  if (typeof value === "number") return value;
  const result = Number.parseInt(value);
  if (isNaN(result)) return def;
  return result;
}

export function parseFloat(
  value: string | number | undefined,
  def: number
): number;
export function parseFloat(value?: string | number, def?: number) {
  if (value === undefined) return def;
  if (typeof value === "number") return value;
  const result = Number.parseFloat(value);
  if (isNaN(result)) return def;
  return result;
}
