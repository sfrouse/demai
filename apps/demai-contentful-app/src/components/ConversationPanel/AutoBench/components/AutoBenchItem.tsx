import { Flex } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import { AIChainOutput } from "../../../../ai/AIStateChain/AIStateChain";
import LoadingIcon from "../../../Loading/LoadingIcon";

const AutoBenchItem = ({ output }: { output: AIChainOutput }) => {
  return (
    <Flex
      flexDirection="column"
      key={output.key}
      style={{
        padding: `${tokens.spacingXs} ${tokens.spacingS}`,
        borderRadius: tokens.borderRadiusSmall,
        color: output.status === "done" ? tokens.colorWhite : tokens.gray700,
        backgroundColor:
          output.status === "initialized"
            ? tokens.gray200
            : output.status === "running"
            ? tokens.blue200
            : output.status === "error"
            ? tokens.red200
            : output.status === "done"
            ? tokens.blue900
            : tokens.gray100,
      }}
    >
      <Flex flexDirection="row" alignItems="center">
        <div
          style={{
            flex: 1,
            fontSize: tokens.fontSizeS,
            lineHeight: tokens.lineHeightS,
            fontWeight: tokens.fontWeightDemiBold,
          }}
        >
          {output.name}
        </div>
        <div style={{ fontSize: 10 }}>
          {output.status === "running" ? <LoadingIcon /> : output.status}
        </div>
      </Flex>
      <div style={{ fontSize: 11, lineHeight: 1.2 }}>{output.content}</div>
    </Flex>
  );
};

export default AutoBenchItem;
