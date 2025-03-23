import * as esbuild from "esbuild";



esbuild.build({
    entryPoints: ["./src/packages.ts", "./src/component.ts"],
    // outfile: "dist/packages.js",
    outdir: "dist",
    bundle: true,
    format: "esm",
    target: "esnext",
    minify: false,
    external: [], // Ensures all dependencies are bundled
    logLevel: "info",
    // keepNames: true,
}).catch(() => process.exit(1));