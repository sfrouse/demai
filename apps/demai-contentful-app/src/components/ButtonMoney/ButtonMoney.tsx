import React from "react";
import styles from "./ButtonMoney.module.css";
import tokens from "@contentful/f36-tokens";

const rainbowColors = [
  "#A50021", // dark red
  "#A85703", // dark orange
  "#7C6F00", // golden mustard
  "#1B6633", // deep green
  "#0B5394", // deep blue
  "#402A91", // strong indigo
  "#7A1E5C", // deep magenta
];

const ButtonRainbow: React.FC<{ label?: string; onClick?: () => void }> = ({
  label = "Show Me the Money",
  onClick,
}) => {
  return (
    <button
      className={styles["rainbow-button"]}
      style={{
        fontSize: tokens.fontSizeM,
        padding: `${tokens.spacingXs} ${tokens.spacingM}`,
        borderRadius: tokens.borderRadiusMedium,
        border: `1px solid ${tokens.gray300}`,
        fontWeight: tokens.fontWeightMedium,
      }}
      onClick={onClick}
    >
      {label.split("").map((char, i) => (
        <span
          key={i}
          style={{ color: rainbowColors[i % rainbowColors.length] }}
        >
          {char}
        </span>
      ))}
    </button>
  );
};

export default ButtonRainbow;
