const rtf = new Intl.RelativeTimeFormat("en", {
  localeMatcher: "best fit",
  numeric: "auto",
  style: "long",
});

export function rtfAutoUnitFormat(ms: number) {
  const u = unit(Math.abs(ms));
  const val = Math.floor(Math.abs(ms) / lut[u]) * Math.sign(ms);
  return rtf.format(val, u);
}

const lut = {
  seconds: 1000,
  minutes: 1000 * 60,
  hours: 1000 * 60 * 60,
  days: 1000 * 60 * 60 * 24,
  months: 1000 * 60 * 60 * 24 * 30,
  years: 1000 * 60 * 60 * 24 * 30 * 12,
} satisfies Partial<Record<Intl.RelativeTimeFormatUnit, number>>;

function unit(s: number): keyof typeof lut {
  let i = 1000;
  if (s < (i *= 60)) return "seconds";
  if (s < (i *= 60)) return "minutes";
  if (s < (i *= 24)) return "hours";
  if (s < (i *= 30)) return "days";
  if (s < (i *= 12)) return "months";
  return "years";
}
