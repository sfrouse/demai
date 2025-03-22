import * as esbuild from "esbuild";

async function compileCode() {
  const result = await esbuild.build({
    stdin: {
      contents: `const x: number = 42; console.log(x);`,
      loader: "ts", // Parse as TypeScript
      resolveDir: process.cwd(), // Helps resolve dependencies if needed
    },
    bundle: false, // No need to bundle unless required
    write: false, // Prevent writing to a file, return output instead
  });

  console.log(result.outputFiles[0].text);
}

// Run compilation
compileCode();
