import { Project } from "ts-morph";
import classParse from "./workers/classParse.mjs";
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import compDefitionToCTFStudio from "./transformers/compDefinitionToCTFStudio.mjs";
import createDir from "./workers/createDir.mjs";
import compDefitionToFigmaCodeConnect from "./transformers/compDefinitionToFigmaCodeConnect.mjs";
import compDefitionToStorybook from "./transformers/compDefinitionToStorybook.mjs";
import { logDone, logStart } from "../log.mjs";
import compDefitionToReact from "./transformers/compDefinitionToReact.mjs";
import { CTFStudioManifest } from "./transformers/compDefinitionsToCTFStudioManifest.mjs";
import compDefitionToAI from "./transformers/compDefinitionToAI.mjs";

export default async function parseCDefs(
    source,
    destPath,
    compsJSUrl,
    compsCssUrl,
    tokenLookupUrl
) {
    logStart('CDefs');
    await createDir(destPath);

    const project = new Project({
        tsConfigFilePath: "tsconfig.json", // Your TypeScript config file
        addFilesFromTsConfig: true, // Include files specified in tsconfig.json
    });
      
    // Load the source file
    // const sourceFiles = project.addSourceFilesAtPaths("src/wc-button/WCButton.ts");
    // const sourceFiles = project.addSourceFilesAtPaths("src/wc-layout/WCLayout.ts");
    const sourceFiles = project.addSourceFilesAtPaths(source);

    // TODO: js and css to arguments...
    const manifest = {
        "baseFolder": "./",
        "componentJavascript": compsJSUrl, // "../index.js",
        "componentCSS": compsCssUrl, // "../tokens/dmo/css/tokens.css",
        "tokenLookup": tokenLookupUrl,
        "definitions": {}
    };

    const studioManifest = new CTFStudioManifest();
    for (const sourceFile of sourceFiles) {
        const classes = sourceFile.getClasses();
        const sourceFilePath = sourceFile.getFilePath();
        for (const cls of classes) {
            const className = cls.getName();
            logStart(`Parsing ${className}`);
            const cdef = await classParse(cls, destPath);
            if (cdef && cdef['$id']) {
                const tagName = cdef['x-cdef'].tag;
                const compDest = `${destPath}`;
                const filePath = `${compDest}/${cdef['$id']}`;
                await createDir(compDest);

                // Move Examples
                logStart('Process Code File', true);
                const examplesResults = await processExamples(
                    cdef,
                    sourceFilePath,
                    compDest,
                    tagName
                );
                logDone('Process Code File', true);

                // Create CDef File
                await writeFile(
                    filePath,
                    JSON.stringify(cdef, null, 2)
                );

                // Establish Class Folder
                const classDestFolder = `${compDest}/${tagName}`;
                await createDir(classDestFolder);
                
                // ========== CTF Studio =================
                logStart('Contentful Studio CDef', true);
                const ctfStudioCDef = compDefitionToCTFStudio(cdef, className);
                if (ctfStudioCDef) {
                    await writeFile(
                        `${classDestFolder}/${className}.studio.ts`,
                        ctfStudioCDef
                    );
                }
                studioManifest.processCompDefinition(className, tagName);
                logDone('Contentful Studio CDef', true);

                // ========== Figma Code Connect ==========
                // NOT PORTABLE ENOUGH YET...
                // logStart('Figma Code Connect', true);
                // const relativePath = path.relative(
                //     path.resolve(classDestFolder),
                //     path.dirname(sourceFilePath)
                // );
                // const figmaCCCDef = compDefitionToFigmaCodeConnect(
                //     cdef,
                //     className,
                //     relativePath
                // );
                // if (figmaCCCDef) {
                //     await writeFile(
                //         `${classDestFolder}/${className}.figma.tsx`,
                //         figmaCCCDef
                //     );
                // }
                // logDone('Figma Code Connect', true);

                // ========== Storybook ===================
                // logStart('Storybook', true);
                // const storybookCDef = compDefitionToStorybook(
                //     cdef,
                //     className,
                //     relativePath,
                //     examplesResults?.content
                // );
                // if (storybookCDef) {
                //     await writeFile(
                //         `${classDestFolder}/${className}.stories.ts`,
                //         storybookCDef
                //     );
                // }
                // logDone('Storybook', true);

                // ========== CTF Studio =================
                logStart('React Component', true);
                const reactComponent = compDefitionToReact(cdef, className);
                if (ctfStudioCDef) {
                    await writeFile(
                        `${classDestFolder}/${className}.react.ts`,
                        reactComponent
                    );
                }
                logDone('React Component', true);

                // ========== AI =========================
                logStart('AI CDef', true);
                const aiCDef = compDefitionToAI(cdef, className);
                if (aiCDef) {
                    await writeFile(
                        `${classDestFolder}/${className}.ai.txt`,
                        aiCDef
                    );
                }
                logDone('AI CDef', true);

                // ============= Manifest ================
                manifest.definitions[tagName] = {
                    id: cdef['$id'],
                    examplesManifest: examplesResults?.manifest || undefined
                }
            }
            logDone(`Parsing ${className}`);
        }
    }
    
    logStart('Manifest');
    await writeFile(
        `${destPath}/manifest.json`,
        JSON.stringify(manifest, null, 2)
    );
    logDone('Manifest');

    // Studio File
    logStart('Studio Register Components');
    await writeFile(
        `${destPath}/register-studio-components.ts`,
        studioManifest.render()
    );
    logDone('Studio Register Components');

    // Final Done
    logDone('CDefs');
}

async function processExamples(cdef, sourceFilePath, dest, tagName) {
    if (!cdef['x-cdef'].examples) return;
    const examplesManifest = [];
    const examplesContent = {};
    const promiseArr = cdef['x-cdef'].examples.map(example => {
        const sourceFileFolder = path.dirname(sourceFilePath);
        return (async () => {
            let exampleFile;
            const exampleFilePath = `${sourceFileFolder}/${example.path}`;
            try {
                exampleFile = await readFile(exampleFilePath, 'utf8');
            } catch (err) {
                console.log("Example error, could NOT find:", exampleFilePath);
                return;
            }
            const exampleFileJSON = JSON.parse(exampleFile);
            const exampleFileName = path.basename(exampleFilePath);
            const exampleFolder = `${dest}/${tagName}/examples`;
            exampleFileJSON.$schema = `../../${cdef.$id}`;
            await createDir(exampleFolder);
            example['$id'] = `${tagName}/examples/${exampleFileName}`;
            example.path = undefined;
            examplesManifest.push({
                name: example.name,
                description: example.description,
                id: example.$id,
            });
            examplesContent[example.name] = exampleFileJSON;
            await writeFile(
                `${exampleFolder}/${exampleFileName}`,
                JSON.stringify(exampleFileJSON, null, 2)
            );
        })();
    });
    await Promise.all(promiseArr);

    return {
        manifest: examplesManifest,
        content: examplesContent
    }
}