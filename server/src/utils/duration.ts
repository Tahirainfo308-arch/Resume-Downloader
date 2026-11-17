export function durationToMilliseconds(value: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(value.trim());

  if (!match) {
    throw new Error(`Invalid duration: ${value}`);
  }

  const amountText = match[1];
  const unit = match[2];

  if (!amountText || !unit) {
    throw new Error(`Invalid duration: ${value}`);
  }

  const factors: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return Number(amountText) * (factors[unit] ?? 1);
}

export function durationToSeconds(value: string): number {
  return Math.floor(durationToMilliseconds(value) / 1000);
}
