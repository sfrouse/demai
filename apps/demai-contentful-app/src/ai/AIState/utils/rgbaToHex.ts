export default function rgbaToHex(color: string): string {
  if (color.startsWith("#")) return color;

  const match = color.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/i
  );
  if (!match) {
    console.error(`color isnt rgba ${color}`);
    // throw new Error("Invalid RGBA color");
    return color;
  }

  const [r, g, b, a] = match
    .slice(1)
    .map((v, i) => (i < 3 ? parseInt(v) : parseFloat(v)));
  //   const alpha = a !== undefined ? Math.round((a as number) * 255) : 255;

  return (
    "#" + [r, g, b].map((x) => Number(x).toString(16).padStart(2, "0")).join("")
  );
}
