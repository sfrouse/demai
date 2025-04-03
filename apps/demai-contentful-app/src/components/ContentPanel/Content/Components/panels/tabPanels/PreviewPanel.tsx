import { Flex, Tabs } from "@contentful/f36-components";
import { COMP_DETAIL_NAVIGATION } from "../CompDetailContent";
import transformExports from "../utils/transformExports";
import precompiledCode from "../../../../../../precompiled/packages";
import { useContentStateSession } from "../../../../../../contexts/ContentStateContext/ContentStateContext";
import generateWebCompInstance from "../utils/generateWebCompInstance";
import useAIState from "../../../../../../contexts/AIStateContext/useAIState";
import { WebCompEditor } from "./WebCompEditor";
import { useState } from "react";
import tokens from "@contentful/f36-tokens";
import Divider from "../../../../../Divider";

export default function PreviewPanel(props: { comp: any | undefined }) {
  const { contentState } = useContentStateSession();
  const { route } = useAIState();
  const [params, setParams] = useState<Record<string, any>>();

  const javascript = props.comp?.fields?.javascript;
  const componentDefinition = props.comp?.fields?.componentDefinition;

  return (
    <Tabs.Panel
      id={COMP_DETAIL_NAVIGATION.PREVIEW}
      forceMount
      style={{
        flex: 1,
        position: `relative`,
        overflow: "hidden",
        display:
          route?.componentFocusId === COMP_DETAIL_NAVIGATION.PREVIEW
            ? "block"
            : "none",
      }}
    >
      <Flex
        flexDirection="column"
        style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <iframe
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            srcDoc={`
<html>
  <head>
    <script type='module'>
      ${transformExports(
        new TextDecoder().decode(
          Uint8Array.from(atob(precompiledCode), (c) => c.charCodeAt(0))
        )
      )}
      ${javascript && javascript.replace(/import/g, "// import")}
    </script>
    <style>
      html, body { padding: 0; margin: 0; }
      ${contentState.css}
    </style>
  </head>
  <body style="
    background-color: ${tokens.gray100};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;">
    ${generateWebCompInstance(componentDefinition, params)}
    
  </body>
</html>`}
          />
        </div>
        <Divider style={{ margin: 0 }} />
        <Flex style={{ padding: tokens.spacingL, gap: tokens.spacingL }}>
          <WebCompEditor
            schema={componentDefinition}
            onChange={(newParams: Record<string, any>) => {
              console.log(params);
              setParams(newParams);
            }}
          />
          <pre
            style={{ whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{
              __html: generateWebCompInstance(
                componentDefinition,
                params,
                true
              ),
            }}
          ></pre>
        </Flex>
        <Divider style={{ margin: 0 }} />
      </Flex>
    </Tabs.Panel>
  );
}
