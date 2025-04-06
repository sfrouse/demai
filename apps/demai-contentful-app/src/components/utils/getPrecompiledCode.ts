import transformExports from "../ContentPanel/Content/Components/panels/utils/transformExports";
import precompiledCode from "../../precompiled/packages";

let cached: ReturnType<typeof transformExports> | null = null;

export default function getPrecompiledCode() {
  if (cached) return cached;

  cached = transformExports(
    new TextDecoder().decode(
      Uint8Array.from(atob(precompiledCode), (c) => c.charCodeAt(0))
    )
  );

  return cached;
}
