// copy-folder.mjs
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

async function copyFolderFromPackage(packageName, folderPath, targetPath) {
  try {
    // Resolve the package root directory dynamically using the package.json
    const packagePath = path.dirname(
      fileURLToPath(await import.meta.resolve(`${packageName}/package.json`))
    );
    const source = path.join(packagePath, folderPath);

    // Check if the source folder exists
    const sourceExists = await fs.pathExists(source);
    if (!sourceExists) {
      console.error(`Source folder ${source} does not exist. Skipping copy.`);
      return;
    }

    // Resolve the target path in the app
    const destination = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      targetPath
    );

    // Empty the destination folder if it exists, or create it if it doesn't
    await fs.emptyDir(destination);

    // Copy the folder asynchronously
    await fs.copy(source, destination);
    console.log(`\n------------------------------`);
    console.log(`Copied        ${folderPath}`);
    console.log(`...from       ${packageName}`);
    console.log(`...to         ${targetPath}`);
    console.log(`source        ${source}`);
    console.log(`destination   ${destination}`);
    console.log(`------------------------------\n`);
  } catch (err) {
    console.error(`Failed to copy folder from ${packageName}:`, err);
  }
}

// Usage example:
// Replace 'your-package', 'folder-to-copy', and 'path/to/target-location' as needed.
copyFolderFromPackage(
  "demai-web-components",
  "dist/cdef",
  "../components/Studio/webComponents"
);
