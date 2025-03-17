import { access, constants, mkdir } from 'fs/promises';

export default async function createDir(dirPath) {
    try {
        await access(dirPath, constants.W_OK);
    } catch (err) {
        await mkdir(dirPath, { recursive: true });
    }
}