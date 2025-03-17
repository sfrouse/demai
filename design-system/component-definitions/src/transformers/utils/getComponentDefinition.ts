import { CDefDefinition, CDefManifest } from "../../types";

const CompDefCache: {[tag:string]: CDefDefinition | false} = {};

export default async function getComponentDefinition(
  cDefPath: string,
  componentTag: string | undefined,
) : Promise<CDefDefinition | undefined> {
  if (!componentTag) return;

  if (CompDefCache[componentTag] !== undefined) {
    if (CompDefCache[componentTag] === false) {
      return undefined;
    }else{
      return CompDefCache[componentTag] as CDefDefinition;
    }
  }
  const manifest: CDefManifest = await fetchJson(`${cDefPath}/manifest.json`);
  if (manifest) {
    const compDefFileById = Object.values(manifest.definitions).find(def => def.id === componentTag);
    // get the root of all definitions from the manifest url
    const compDefFile = compDefFileById ? compDefFileById.id : 
      manifest.definitions[componentTag] ? manifest.definitions[componentTag].id : undefined;
    if (!compDefFile) return;
  
    const url = `${cDefPath}/${compDefFile}`;
    // load just that definition
    const compDef: CDefDefinition = await fetchJson(url);
    CompDefCache[componentTag] = compDef;
    return compDef;
  }
  CompDefCache[componentTag] = false;
  return undefined;
}

export async function fetchJson(url: string): Promise<any | false> {
  const response = await fetch(`${url}?${Math.floor(Math.random()*100000)}`);
  if (!response.ok) {
    console.log(`error loading ${url}: ${response.status}`);
    return false;
  }
  let json;
  try {
    json = await response.json();
  } catch (jsonError: any) {
    console.log(`Error parsing JSON: ${jsonError.message || 'Unknown error'}`);
    return false;
  }
  return json;
}