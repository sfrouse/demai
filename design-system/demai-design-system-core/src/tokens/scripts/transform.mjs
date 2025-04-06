import fs from 'fs';
import path, { dirname } from 'path';
import transformTokens from "./transformTokens.mjs";
import { fileURLToPath } from 'url';

export default function transform() {
    (async () => {
        const demoTokens = await loadRelativePathJSON('../tokens/dmo.tokens.json');
        if (!demoTokens) {
            console.error('Error: could not load the token files.');
            return;
        }
        const fileInfo = await transformTokens(
            demoTokens,
            'demai',
            _relativeToAbsolutPath('../../../dist/tokens')
        );

        for (const file of fileInfo) {
            const folderPath = dirname(file.path);
            if (!fs.existsSync(folderPath)){
                fs.mkdirSync(folderPath, { recursive: true });
            }
            await fs.promises.writeFile(
                file.path,
                file.content
            )
        }
    })();
}

async function loadRelativePathJSON(localPath) {
    try {
        // const currentDir = path.dirname(fileURLToPath(import.meta.url));
        const relativePath = _relativeToAbsolutPath(localPath);// `${currentDir}/${localPath}`;
        const data = await fs.promises.readFile(relativePath, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (err) {
        console.error('Error reading JSON file:', err);
    }
}

function _relativeToAbsolutPath(localPath) {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    return `${currentDir}/${localPath}`;
}
 
transform();