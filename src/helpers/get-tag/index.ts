export default function getTag(version: string): string | void {
  if (/alfa/.test(version)) return "alfa";
  if (/beta/.test(version)) return "beta";
  if (/unstable/.test(version)) return "unstable";
}
