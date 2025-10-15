const RTF = new Intl.RelativeTimeFormat("en", {
  localeMatcher: "best fit",
  numeric: "auto",
  style: "long",
});

export function rtfAutoUnitFormat(ms: number, rtf = RTF) {
  const u = unit(Math.abs(ms));
  const val = Math.floor(Math.abs(ms) / LUT[u]) * Math.sign(ms);
  return rtf.format(val, u);
}

// @ts-ignore: Intl.DurationFormat exists but currently has no types available
const DTF = new Intl.DurationFormat("nl", {
  style: "digital",
  hoursDisplay: "auto",
});

export function dfAutoFormat(ms: number, dtf = DTF) {
  return dtf.format({
    minutes: Math.floor(ms / (1000 * 60)),
    seconds: Math.floor(ms / 1000) % 60,
  });
}

const LUT = {
  seconds: 1000,
  minutes: 1000 * 60,
  hours: 1000 * 60 * 60,
  days: 1000 * 60 * 60 * 24,
  months: 1000 * 60 * 60 * 24 * 30,
  years: 1000 * 60 * 60 * 24 * 30 * 12,
} satisfies Partial<Record<Intl.RelativeTimeFormatUnit, number>>;

function unit(s: number): keyof typeof LUT {
  let i = 1000;
  if (s < (i *= 60)) return "seconds";
  if (s < (i *= 60)) return "minutes";
  if (s < (i *= 24)) return "hours";
  if (s < (i *= 30)) return "days";
  if (s < (i *= 12)) return "months";
  return "years";
}
