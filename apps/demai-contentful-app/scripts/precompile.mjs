import esbuild from "esbuild";

await esbuild.build({
    entryPoints: [
        "node_modules/lit/index.js",
        // "node_modules/@lit/reactive-element/index.js",
        "node_modules/@lit-labs/react/index.js",
        "node_modules/@lit-labs/task/index.js",
        "node_modules/@lit-labs/context/index.js",
    ],
    bundle: true,
    format: "esm",
    // outdir: "dist/precompile",
    outfile: "lit-design-system.js",
    minify: true,
    sourcemap: false,
    external: [],
});