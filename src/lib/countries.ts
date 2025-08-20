import raw from "world-countries";

const flag = (cca2: string) =>
  cca2
    .toUpperCase()
    .replace("/./g", (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

export const countriesList = raw
  .map((c) => ({
    value: c.cca2,
    label: c.name.common,
    flag: flag(c.cca2),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));
