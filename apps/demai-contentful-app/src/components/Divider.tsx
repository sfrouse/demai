import React from "react";
import tokens from "@contentful/f36-tokens";

type DividerProps = {
  style?: React.CSSProperties; // ✅ Accepts React's style attribute
};

const Divider: React.FC<DividerProps> = ({ style }) => {
  return (
    <hr
      style={{
        width: "100%",
        border: "none",
        height: "1px",
        backgroundColor: tokens.gray200,
        ...style, // ✅ Allows custom styles to override defaults
      }}
    />
  );
};

export default Divider;
