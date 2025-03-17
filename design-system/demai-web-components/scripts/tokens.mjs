import path from 'path';
import { promises as fsp } from 'fs';
import { fileURLToPath } from 'url';

// Helper function to copy directories recursively
async function copyDirectory(source, target) {
    const entries = await fsp.readdir(source, { withFileTypes: true });
    await fsp.mkdir(target, { recursive: true });

    for (let entry of entries) {
        const srcPath = path.join(source, entry.name);
        const tgtPath = path.join(target, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(srcPath, tgtPath);
        } else {
            await fsp.copyFile(srcPath, tgtPath);
        }
    }
}

async function copyModuleDirectory(moduleDirectory, outputDir) {
    try {
        // Ensure the output directory exists
        await fsp.mkdir(outputDir, { recursive: true });

        // Attempt to resolve the full path of the directory within the module
        let fullPath;
        try {
            fullPath = await import.meta.resolve(moduleDirectory);
            fullPath = fileURLToPath(fullPath); // Convert URL to file system path
        } catch (error) {
            // If the moduleDirectory is a valid URL or an external file, fallback to using it as a URL
            fullPath = fileURLToPath(new URL(moduleDirectory));
        }

        // Copy the contents of the directory to the destination in the output directory
        // (ensuring the destination directory is already created)
        await copyDirectory(fullPath, outputDir);
        console.log(`Contents of directory ${fullPath} copied to ${outputDir}`);
    } catch (error) {
        console.error('Error in copying directory contents:', error);
    }
}


copyModuleDirectory(
    'demai-design-system-core/dist/tokens',
    path.resolve('dist/tokens')
);
