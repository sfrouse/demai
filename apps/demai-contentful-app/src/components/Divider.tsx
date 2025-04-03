import React from "react";
import tokens from "@contentful/f36-tokens";

type DividerProps = {
  style?: React.CSSProperties;
  direction?: "horizontal" | "vertical";
};

const Divider: React.FC<DividerProps> = ({
  style,
  direction = "horizontal",
}) => {
  const isVertical = direction === "vertical";

  return (
    <div
      style={{
        width: isVertical ? "1px" : "100%",
        height: isVertical ? "100%" : "1px",
        minWidth: isVertical ? "1px" : "100%",
        minHeight: isVertical ? "100%" : "1px",
        margin: isVertical ? `0 ${tokens.spacingXs}` : `${tokens.spacingXs} 0`,
        backgroundColor: tokens.gray200,
        ...style,
      }}
    />
  );
};

export default Divider;
