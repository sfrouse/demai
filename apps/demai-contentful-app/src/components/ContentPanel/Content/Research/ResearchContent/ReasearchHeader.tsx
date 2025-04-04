import React from "react";
import { Text } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";

type Props = {
  title: string;
};

const ResearchHeader: React.FC<Props> = ({ title }) => (
  <Text
    fontSize="fontSizeS"
    fontWeight="fontWeightNormal"
    style={{
      color: tokens.blue600,
      textTransform: "uppercase",
    }}
  >
    {title}
  </Text>
);

export default ResearchHeader;
