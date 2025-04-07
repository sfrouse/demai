import { Flex, Text } from "@contentful/f36-components";
import { COLOR_ALLOW_LIST } from "../DSysTokensContent";
import Divider from "../../../../Divider";
import tokens from "@contentful/f36-tokens";
import { DESIGN_SYSTEM_PREFIX } from "../../../../../constants";

const ColorTokensContent = ({
  dsysTokens,
  useCssVars = true,
}: {
  dsysTokens: any;
  useCssVars?: boolean;
}) => {
  if (!dsysTokens?.color) return null;
  return (
    <Flex flexDirection="column">
      {COLOR_ALLOW_LIST.map((name) => {
        const value = dsysTokens.color[name];
        if (!value) return null;

        const isSingle = typeof value === "string";

        return (
          <Flex flexDirection="column" key={`color-token-${name}`}>
            <Flex
              flexDirection="row"
              gap="4px"
              alignItems="center"
              style={{ margin: `${tokens.spacingM} 0` }}
            >
              <Text
                fontSize="fontSizeM"
                fontWeight="fontWeightNormal"
                style={{ minWidth: 100 }}
              >
                {name}
              </Text>
              <Flex flexDirection="row" gap="6px">
                {isSingle ? (
                  <ColorChip
                    name={name}
                    color={value}
                    useCssVars={useCssVars}
                  />
                ) : (
                  value &&
                  Object.entries(value as Record<string, string>)?.map(
                    ([sub, hex]) => (
                      <ColorChip
                        key={sub}
                        name={`${name}-${sub}`}
                        color={hex}
                        useCssVars={useCssVars}
                      />
                    )
                  )
                )}
              </Flex>
            </Flex>
            <Divider style={{ margin: 0 }} />
          </Flex>
        );
      })}
    </Flex>
  );
};

const ColorChip = ({
  name,
  color,
  useCssVars,
}: {
  name: string;
  color: string;
  useCssVars: boolean;
}) => {
  if (typeof color !== "string") return null;
  return (
    <div
      title={`${name}: ${color}`}
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundColor: useCssVars
          ? `var( --${DESIGN_SYSTEM_PREFIX}-color-${name} )`
          : color,
        border: "1px solid #aaa",
      }}
    />
  );
};

export default ColorTokensContent;
