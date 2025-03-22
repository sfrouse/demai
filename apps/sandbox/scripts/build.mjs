import * as esbuild from "esbuild";

esbuild.build({
    entryPoints: ["my-component.ts"],
    outfile: "dist/my-component.js",
    bundle: true,
    format: "esm",
    target: "esnext",
    minify: true,
    external: [], // Ensures all dependencies are bundled
    logLevel: "info"
}).catch(() => process.exit(1));