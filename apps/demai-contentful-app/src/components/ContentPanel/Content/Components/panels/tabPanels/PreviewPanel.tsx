import { Flex, Tabs } from "@contentful/f36-components";
import { COMP_DETAIL_NAVIGATION } from "../CompDetailContent";
import { useContentStateSession } from "../../../../../../contexts/ContentStateContext/ContentStateContext";
import generateWebCompInstance from "../utils/generateWebCompInstance";
import useAIState from "../../../../../../contexts/AIStateContext/useAIState";
import { WebCompEditor } from "./WebCompEditor";
import { useState } from "react";
import tokens from "@contentful/f36-tokens";
import Divider from "../../../../../Divider";
import getPrecompiledCode from "../../../../../utils/getPrecompiledCode";
import styles from "./PreviewPanel.module.css";
import validateComponent, {
  ValidationResult,
} from "../utils/validateComponent";

export default function PreviewPanel(props: {
  javascript: string;
  componentDefinition: string;
  bindings: string;
}) {
  const { javascript, componentDefinition, bindings } = props;
  const { contentState } = useContentStateSession();
  const { route } = useAIState();
  const [params, setParams] = useState<Record<string, any>>();

  const validResults = validateComponent(
    componentDefinition,
    bindings,
    javascript
  );

  const cDefObj = validResults?.cdef.success
    ? JSON.parse(componentDefinition)
    : {};

  return (
    <Tabs.Panel
      id={COMP_DETAIL_NAVIGATION.PREVIEW}
      forceMount
      className={styles.previewPanel}
      style={{
        flex: 1,
        position: `relative`,
        overflow: "hidden",
        border: "1xp solid red",
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
      ${getPrecompiledCode()}
      ${
        validResults.valid && javascript
          ? javascript.replace(/import/g, "// import")
          : ""
      }
    </script>
    <style>
      html, body { padding: 0; margin: 0; }
      ${validResults.valid ? contentState.css : ""}
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
    ${validResults.valid ? generateWebCompInstance(cDefObj, params) : ""}
  </body>
</html>`}
          />
        </div>
        <Divider style={{ margin: 0 }} />
        <Flex style={{ padding: tokens.spacingL, gap: tokens.spacingL }}>
          {validResults.valid ? (
            <>
              <WebCompEditor
                schema={cDefObj}
                onChange={(newParams: Record<string, any>) => {
                  setParams(newParams);
                }}
              />
              <pre
                style={{ whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{
                  __html: generateWebCompInstance(cDefObj, params, true),
                }}
              ></pre>
            </>
          ) : (
            ""
          )}
        </Flex>
        <Divider style={{ margin: 0 }} />
      </Flex>
    </Tabs.Panel>
  );
}
