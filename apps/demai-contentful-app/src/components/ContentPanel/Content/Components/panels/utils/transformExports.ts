export default function transformExports(code: string) {
  return code.replace(/export\s*{\s*([^}]+)\s*};/g, (match, exportsList) => {
    // Split exports by commas and format as `const` assignments
    const declarations = exportsList
      .split(",")
      .map((exp: any) => {
        const [original, alias] = exp
          .split(" as ")
          .map((s: string) => s.trim());
        return `const ${alias || original} = ${original};`;
      })
      .join("\n");

    return declarations;
  });
}
