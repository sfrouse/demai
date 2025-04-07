import { Flex, Text } from "@contentful/f36-components";
import Divider from "../../../../Divider";
import tokens from "@contentful/f36-tokens";
import { DESIGN_SYSTEM_PREFIX } from "../../../../../constants";

export const TYPOGRAPHY_ALLOW_LIST = ["display", "heading", "body", "label"];
const T_SHIRT_SIZES = ["2xl", "xl", "lg", "md", "sm", "xs", "2xs"]; // sort them

interface TypographyToken {
  family: string;
  lineheight: string;
  size: string;
  weight: string;
}

interface DsysTokens {
  [key: string]: {
    [key: string]: TypographyToken;
  };
}

const TypographyTokensContent = ({
  dsysTokens,
}: {
  dsysTokens: DsysTokens;
}) => {
  if (!dsysTokens?.color) return null;

  return (
    <>
      {TYPOGRAPHY_ALLOW_LIST.map((typename) => {
        const typeTokens = dsysTokens[typename];
        return T_SHIRT_SIZES.map((size) => {
          const token = typeTokens[size];
          if (!token) return null;
          return (
            <Flex flexDirection="column" key={`${typename}-${size}`}>
              <Flex
                flexDirection="row"
                gap="4px"
                alignItems="center"
                style={{
                  margin: `${tokens.spacingM} 0`,
                }}
              >
                <Text
                  fontSize="fontSizeM"
                  fontWeight="fontWeightNormal"
                  style={{ minWidth: 100 }}
                >
                  {typename}-{size}
                </Text>
                <div
                  style={{
                    // fontFamily: token.family,
                    // lineHeight: token.lineheight,
                    // fontSize: token.size,
                    // fontWeight: token.weight,
                    font: `var( --${DESIGN_SYSTEM_PREFIX}-type-${typename}-${size} )`,
                    flex: 1,
                    position: "relative",
                  }}
                >
                  W
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      backgroundColor: "white",
                    }}
                  >
                    The quick brown fox jumps over a lazy dog.
                  </div>
                </div>
              </Flex>
              <Divider style={{ margin: 0 }} />
            </Flex>
          );
        });
      })}
    </>
  );
};

export default TypographyTokensContent;
