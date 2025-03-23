import esbuild from "esbuild";
import fs from "fs/promises";
import path from "path";

const result = await esbuild.build({
    entryPoints: ["./scripts/packages.ts"],
    bundle: true,
    format: "esm",
    // outfile: "dist/packages.js",
    outdir: "src/precompiled/",
    minify: true,
    sourcemap: false,
    external: [],
    write: false, // Prevents writing to file directly
});

for (const file of result.outputFiles) {
    const outputPath = file.path;
    const base64Code = Buffer.from(file.text, "utf-8").toString("base64");

    // Wrap in a module-friendly export
    const wrappedCode = `const codeBase64 = "${base64Code}";\nexport default codeBase64;\n`;

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Write the new wrapped file
    await fs.writeFile(outputPath, wrappedCode, "utf8");

    console.log(`Bundled file written to: ${outputPath}`);
}