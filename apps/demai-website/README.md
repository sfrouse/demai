# contentful-demos-website
<!-- 
  Do not edit directly, built using contentful-readme-generator.
  Content details in Build Information below.
-->

- [Description](#description)
- [Demo Website Env Variable Usage](#demo-website-env-variable-usage)
- [Demo Website Typescript Typings Generation](#demo-website-typescript-typings-generation)
- [Adding a Component Workflow](#adding-a-component-workflow)
- [Build Information](#build-information)

---


__Project Abbreviation__: CDMO - WEB

__Developer Emails__: scott.rouse@contentful.com

## Description

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Demo Website Env Variable Usage
Environment variables for the demo website are dynamically generated because the deployment process is configuration-based. The actual name of the space can vary according to what’s specified in the configuration file, meaning the environment variables must reflect this dynamic name. However, environment variables prefixed with NEXT_PUBLIC are statically injected into the client-side code, preventing dynamic requests for these values.

As a result, the solution involves creating environment variables that are accessible by the server and then passed to client-side features, like Studio, which require them.

An open question remains around whether these environment variables should use the NEXT_PUBLIC prefix. While they are technically used on the client side, they are not exposed directly to the code like the NEXT_PUBLIC prefixed variables. This may need to be revisited for future adjustments.

[&#9998; edit](https://app.contentful.com/spaces/zkwkpgru7akk/environments/master/entries/7mv30lILVq4ipU4t0QCWIF)

## Demo Website Typescript Typings Generation
The TypeScript typings are generated dynamically using the cf-content-types-generator package. You can find this setup both in the package file and in the scripts folder, within the types generator file. The generator outputs typings to the @types directory, where you’ll find definitions for all Content Types in the source space.

Currently, this setup supports a single source space, so it will have to be updated to handle multiple spaces in the future and make sure same name conflicts don't happen. The process has been updated to use the latest type definitions compatible with Contentful SDK 10+, including skeleton types and other recent additions.

[&#9998; edit](https://app.contentful.com/spaces/zkwkpgru7akk/environments/master/entries/1ooz8QZsmfh7o3MFGnzxbh)

## Adding a Component Workflow
1. Create Web Component. Picking a small component and copy/pasting it's folder works well.
  2. Create Web Component Scss.
3. Add Web Component to ```./web-components/src/index.ts``` This will add it to the full component package.
4. Create Contentful C.Type. These can either be explicit view C.Type or can be the default for a content C.Type.
5. Generate Typings.
  6. ```npm run build:cdefs``` in website
  7. ```npm run build``` in web-components
8. Create Controller. Copy/Pasting existing works well. Make sure to change ALL typings and map as needed.
9. Map C.Type Id to Controller in ```./website/controllers/index.ts```
10. Build website...it copy/pastes components into local director for Studio.tsx (TODO: eliminate this...packaging issue)

You now have a working web component that will automatically show up for that c.type and a Studio component.


[![Contentful <> Web Component Controller Mapping](https://images.ctfassets.net/zkwkpgru7akk/60jODsWCMgvRSFiJQF6qAd/d59e5a5bd8e49907d1b48e49d4a2206e/Contentful____Web_Component_Controller_Mapping.png)](https://images.ctfassets.net/zkwkpgru7akk/60jODsWCMgvRSFiJQF6qAd/d59e5a5bd8e49907d1b48e49d4a2206e/Contentful____Web_Component_Controller_Mapping.png "View Full Size")
    
Contentful <> Web Component Controller Mapping, source: [contentful](https://app.contentful.com/spaces/zkwkpgru7akk/environments/master/entries/22bwUdKZ5BaXSk331u66hm), [figma](https://www.figma.com/file/MDqBElffWlhC4lvzdScwXb/?node-id=130:6317)


[&#9998; edit](https://app.contentful.com/spaces/zkwkpgru7akk/environments/master/entries/5Vxn1Q6jbPziuploSH9mZo)

## Build Information

*Dynamically built using contentful-readme-generator. Do not edit directly.*

*__updated__: 12/3/2024, 12:59:00 PM*

*__space__: zkwkpgru7akk*

*__environment__: master*

*__entity id__: 1XmSnbZOE0bTpqZh1rJuAe*

[&#9998; edit](https://app.contentful.com/spaces/zkwkpgru7akk/environments/master/entries/1XmSnbZOE0bTpqZh1rJuAe)
