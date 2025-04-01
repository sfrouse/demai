type TmpTokenCollection = {
  name: string;
  collections: {
    name: string;
    modes: {
      tokens: {
        name: string;
        type: string;
        value: { r: number; g: number; b: number; a: number };
      }[];
    }[];
  }[];
};

export default function updateColorSetInTokens(
  tokens: any,
  name: string,
  colorSet: { [key: string]: string }
) {
  const newTokens = JSON.parse(
    JSON.stringify(tokens)
  ) as unknown as TmpTokenCollection;
  const primitives = newTokens.collections.find(
    (collection) => collection.name === "primitives"
  );
  if (primitives && primitives.modes.length > 0) {
    primitives.modes[0].tokens.map((token) => {
      const tokenNameArr = token.name.split("/");
      const tokenNameStep = tokenNameArr.pop();
      if (tokenNameStep) {
        const colorSetColor = colorSet[tokenNameStep];
        if (
          colorSetColor &&
          token.name.indexOf(`${name}/${tokenNameStep}`) !== -1
        ) {
          token.value = hexToRgba(colorSetColor);
        }
      }
    });
  }
  return newTokens;
}

function hexToRgba(hex: string, alpha = 1) {
  hex = hex.replace(/^#/, "");

  let r, g, b;
  if (hex.length === 3) {
    // Convert shorthand hex (#RGB to #RRGGBB)
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    throw new Error("Invalid hex color");
  }

  return {
    r: r / 255,
    g: g / 255,
    b: b / 255,
    a: alpha,
  };
}
