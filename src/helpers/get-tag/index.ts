export default function getTag(version: string): string | void {
  if (/alpha/.test(version)) return "alpha";
  if (/beta/.test(version)) return "beta";

  const matches = version.match(new RegExp("(unstable(.*))\\.\\d+"));

  if (matches) return matches[1];
}
