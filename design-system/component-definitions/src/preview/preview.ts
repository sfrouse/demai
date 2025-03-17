import { ContentfulLivePreview } from '@contentful/live-preview';
import { Entry, createClient } from 'contentful';
import contentfulInstanceToDefinitionInstance from '../transformers/contentfulInstanceToDefinitionInstance';
import definitionInstanceToWebInstance from '../transformers/definitionInstanceToWebInstance';

type Config = {
  locale: string,
  entry_id: string,
  debug_mode: boolean,
  contentful_space_id: string,
  contentful_environment_id: string,
  contentful_access_token: string,
}

// Config
const config: Config = {
  locale: 'en-US',
  entry_id: '',
  debug_mode: false,
  contentful_space_id: '',
  contentful_environment_id: '',
  contentful_access_token: '',
};

// gather parameters...
const urlParams = new URLSearchParams(window.location.search);
Object.keys(config).map((key: string) => {
  (config as any)[key] = urlParams.get(key) || (config as any)[key];
});

console.log('[PREVIEW] config', config);

document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {

  if (!config.entry_id) return;

  const client = createClient({
    space: config.contentful_space_id,
    environment: config.contentful_environment_id,
    accessToken: config.contentful_access_token,
    host: 'preview.contentful.com',
  });

  await ContentfulLivePreview.init({
    locale: config.locale,
    enableInspectorMode: false// true
  });


  // TODO: load all needed entries recursively first
  // const entries = await client
  //   .getEntries({
  //     ['sys.id']:config.entry_id,
  //     'include': 10
  //   });

  client
    // .getEntry(config.entry_id)
    .getEntries({
      ['sys.id']:config.entry_id,
      'include': 10
    })
    .then(async (entries) => {
      if (entries && entries.items.length === 0) return;
      let entry = entries.items[0];
      const webCompNode = document.getElementById('web-component') as any;
      const compInst = await contentfulInstanceToDefinitionInstance(entry, (globalThis as any).cdefPath);
      const webComp = await definitionInstanceToWebInstance(compInst, (globalThis as any).cdefPath);
      // con sole.log('compInst', compInst);
      // con sole.log('webComp', webComp);
      if (!webCompNode) return;
      webCompNode.innerHTML = webComp;
      console.log('[PREVIEW] compInst', compInst);

      ContentfulLivePreview.subscribe('edit', {
          data: entry,
          locale: config.locale,
          callback: (arg: any) => {
            (async () => {
              // !!!! updatedEntry is not complete...it assumes React responsive doms I think
              const updatedEntry: Entry = arg as Entry;
              const entries = await client
                .getEntries({
                  ['sys.id']:config.entry_id,
                  'include': 10
                });
              if (entries && entries.items.length === 0) return;
              const loadedEntry = entries.items[0];

              decorateLeaves(updatedEntry, loadedEntry);
              const finalEntry = entries.items[0];
              
              const compInst = await contentfulInstanceToDefinitionInstance(
                finalEntry,
                (globalThis as any).cdefPath
              );
              const webComp = await definitionInstanceToWebInstance(
                compInst,
                (globalThis as any).cdefPath
              );
              // const debug = `
              //   <textarea style="width: 100vw; height: 50vh;">${webComp}</textarea>
              //   <textarea style="width: 100vw; height: 50vh;">${JSON.stringify(compInst, null, 2)}</textarea>`;
              webCompNode.innerHTML = `${webComp}`;// ${debug}`;
              console.log('[PREVIEW] FINAL EDIT: compInst', compInst);
            })();
          }
      });
      ContentfulLivePreview.toggleInspectorMode();
    })
    .catch((err) => console.error(err));
} 

function decorateLeaves(source: {}, target: {}) {
  Object.entries(source).map(entry => {
    const name = entry[0];
    const value = entry[1] as any;
    const targetValue = (target as any)[name];
    if (!targetValue) return;
    if (Array.isArray(value)) {
      value.map((child, index) => {
        const targetChild = targetValue[index];
        if (!targetChild) return;
        decorateLeaves(child, targetChild);
      });
    }else if (isObject(value)) {
      decorateLeaves(value, targetValue);
    }else{
      (target as any)[name] = value;
    }
  });
}

function isObject(a: any) {
  return (typeof a === "object" || typeof a === 'function') && (a !== null) && !Array.isArray(a);
}