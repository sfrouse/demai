import tokens from "@contentful/f36-tokens";

export default function LoadingStyles(isLoading: boolean): React.CSSProperties {
  return {
    backgroundColor: isLoading ? tokens.gray100 : tokens.colorWhite,
    opacity: isLoading ? 0.6 : 1,
    pointerEvents: isLoading ? "none" : "auto",
  };
}
