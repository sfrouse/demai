import tokens from "@contentful/f36-tokens";
import { useEffect, useState } from "react";
import AIState from "../../../ai/AIState/AIState";
import Divider from "../../Divider";
import styles from "./ConversationBubble.module.css";
import scrollBarStyles from "../../utils/ScrollBarMinimal.module.css";
import classNames from "../../utils/classNames";
import convertMarkdown from "../util/convertMarkdown";
import ConversationToolbar from "./ConversationToolbar";
import ConversationTitle from "./ConversationTitle";

const ConversationBubble = ({ aiState }: { aiState: AIState }) => {
  if (!aiState) return null;
  const [showSystem, setShowSystem] = useState<boolean>(false);
  const [systemHtml, setSystemHtml] = useState<string>("");
  const [requestHtml, setRequestHTML] = useState<string>("");
  const [responseHtml, setResponseHTML] = useState<string>("");
  const [executionResponseHtml, setExecutionResponseHTML] =
    useState<string>("");

  useEffect(() => {
    (async () => {
      const newHTML = convertMarkdown(
        `${aiState.promptEngine.system.content}`,
        styles
      );
      setSystemHtml(newHTML);
    })();
  }, [aiState.promptEngine.system]);

  useEffect(() => {
    (async () => {
      const newHTML = convertMarkdown(`${aiState.request}`, styles);
      setRequestHTML(newHTML);
    })();
  }, [aiState.request]);

  useEffect(() => {
    (async () => {
      const newHTML = convertMarkdown(`${aiState.response}`, styles);
      setResponseHTML(newHTML);
    })();
  }, [aiState.response]);

  useEffect(() => {
    (async () => {
      const newHTML = convertMarkdown(`${aiState.executionResponse}`, styles);
      setExecutionResponseHTML(newHTML);
    })();
  }, [aiState.executionResponse]);

  if (!aiState.request) {
    return (
      <div
        style={{
          alignSelf: "flex-start",
          backgroundColor: tokens.colorWhite,
          maxWidth: "100%",
          width: "100%",
          fontSize: tokens.fontSizeM,
          paddingBottom: tokens.fontSizeM,
        }}
      >
        <span>{aiState.promptEngine.introMessage}</span>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        styles["conversation-state"],
        scrollBarStyles["scrollbar-minimal"]
      )}
      style={{
        alignSelf: "flex-start",
        width: "100%",

        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "break-word",

        margin: 0,
        marginBottom: tokens.spacingS,
        fontFamily: tokens.fontStackPrimary,
        backgroundColor: tokens.gray100,
        borderRadius: tokens.borderRadiusMedium,
        fontSize: 12,
      }}
    >
      <div
        style={{
          padding: `${tokens.spacingM} ${tokens.spacingL}`,
        }}
      >
        <ConversationTitle title="Prompt" />
        <span dangerouslySetInnerHTML={{ __html: requestHtml }}></span>
      </div>
      {showSystem && (
        <>
          <Divider style={{ marginTop: 0 }} />
          <div
            style={{
              padding: `${tokens.spacingM} ${tokens.spacingL}`,
            }}
          >
            <ConversationTitle title="System" />
            <span dangerouslySetInnerHTML={{ __html: systemHtml }}></span>
          </div>
        </>
      )}
      {aiState.response && (
        <>
          <Divider style={{ marginTop: 0 }} />
          <div
            style={{
              padding: `${tokens.spacingM} ${tokens.spacingL}`,
            }}
          >
            <ConversationTitle title="Suggestion" />
            <span dangerouslySetInnerHTML={{ __html: responseHtml }}></span>
          </div>
        </>
      )}
      {aiState.executionResponse && (
        <>
          <Divider style={{ marginTop: 0 }} />
          <div
            style={{
              padding: `${tokens.spacingM} ${tokens.spacingL}`,
            }}
          >
            <ConversationTitle title="Results" />
            <span
              dangerouslySetInnerHTML={{ __html: executionResponseHtml }}
            ></span>
          </div>
        </>
      )}
      <ConversationToolbar aiState={aiState} setShowSystem={setShowSystem} />
    </div>
  );

  // switch (aiState.role) {
  //   case "user": {
  //     return (
  //       <div
  //         className={classNames(
  //           styles["conversation-state"],
  //           scrollBarStyles["scrollbar-minimal"]
  //         )}
  //         style={{
  //           alignSelf: "flex-end",
  //           backgroundColor: tokens.blue100,
  //           ...baseCSS,
  //         }}
  //       >
  //         <span dangerouslySetInnerHTML={{ __html: requestHtml }}></span>
  //         <Divider />
  //         <Flex flexDirection="row" alignContent="center">
  //           {stats}
  //           <div style={{ flex: 1, minWidth: 30 }}></div>
  //           <ButtonXs
  //             onClick={async () => {
  //               await aiState.run(contentState);
  //             }}
  //           >
  //             Run Again
  //           </ButtonXs>
  //         </Flex>
  //       </div>
  //     );
  //   }
  //   case "assistant": {
  //     switch (aiState.phase) {
  //       case AIStatePhase.executing:
  //         return (
  //           <div
  //             className={classNames(
  //               styles["conversation-state"],
  //               scrollBarStyles["scrollbar-minimal"]
  //             )}
  //             style={{
  //               alignSelf: "flex-start",
  //               backgroundColor: tokens.green100,
  //               ...baseCSS,
  //             }}
  //           >
  //             <span dangerouslySetInnerHTML={{ __html: requestHtml }}></span>
  //             {!aiState.isRunning ? <Divider /> : null}
  //             {stats}
  //           </div>
  //         );

  //       case AIStatePhase.executed:
  //         return (
  //           <div
  //             className={classNames(
  //               styles["conversation-state"],
  //               scrollBarStyles["scrollbar-minimal"]
  //             )}
  //             style={{
  //               alignSelf: "flex-start",
  //               backgroundColor: tokens.green100,
  //               ...baseCSS,
  //             }}
  //           >
  //             <span dangerouslySetInnerHTML={{ __html: requestHtml }}></span>
  //             <Divider />
  //             <Flex flexDirection="row" alignContent="center">
  //               {stats}
  //               <div style={{ flex: 1, minWidth: 30 }}></div>
  //               {!aiState.isRunning ? (
  //                 <ButtonXs
  //                   onClick={async () => {
  //                     await aiState.run(contentState, true);
  //                   }}
  //                 >
  //                   Re-Execute
  //                 </ButtonXs>
  //               ) : null}
  //             </Flex>
  //           </div>
  //         );

  //       case AIStatePhase.describing:
  //         return (
  //           <div
  //             className={classNames(
  //               styles["conversation-state"],
  //               scrollBarStyles["scrollbar-minimal"]
  //             )}
  //             style={{
  //               alignSelf: "flex-start",
  //               backgroundColor: tokens.gray100,
  //               ...baseCSS,
  //             }}
  //           >
  //             <span dangerouslySetInnerHTML={{ __html: requestHtml }}></span>
  //             <Divider />
  //             <Flex flexDirection="row" alignContent="center">
  //               {stats}
  //               <div style={{ flex: 1, minWidth: 30 }}></div>
  //               {!aiState.isRunning ? (
  //                 <ButtonXs
  //                   onClick={async () => {
  //                     await aiState.run(contentState);
  //                   }}
  //                 >
  //                   Execute
  //                 </ButtonXs>
  //               ) : null}
  //             </Flex>
  //           </div>
  //         );

  //       case AIStatePhase.prompting:
  //         return (
  //           <div
  //             className={classNames(
  //               styles["conversation-state"],
  //               scrollBarStyles["scrollbar-minimal"]
  //             )}
  //             style={{
  //               alignSelf: "flex-start",
  //               backgroundColor: tokens.colorWhite,
  //               ...baseCSS,
  //               maxWidth: "100%",
  //               width: "100%",
  //               fontSize: tokens.fontSizeL,
  //             }}
  //           >
  //             <span dangerouslySetInnerHTML={{ __html: requestHtml }}></span>
  //             <Divider />
  //             <Flex flexDirection="row" alignContent="center">
  //               {stats}
  //             </Flex>
  //           </div>
  //         );

  //       default:
  //         return (
  //           <div
  //             className={classNames(
  //               styles["conversation-state"],
  //               scrollBarStyles["scrollbar-minimal"]
  //             )}
  //             style={{
  //               alignSelf: "flex-start",
  //               backgroundColor: tokens.gray100,
  //               ...baseCSS,
  //             }}
  //           >
  //             <span dangerouslySetInnerHTML={{ __html: requestHtml }}></span>
  //             <Divider />
  //             <Flex flexDirection="row" alignContent="center">
  //               {stats}
  //             </Flex>
  //           </div>
  //         );
  //     }
  //   }
  //   default: {
  //     return "";
  //   }
  // }
};

export default ConversationBubble;
