// Types for parse and validation results
type ParseSuccess<T = any> = { success: true; data: T };
type ParseError = { success: false; error: string };

type JSONParseResult<T = any> = ParseSuccess<T> | ParseError;
type JavaScriptValidationResult = { success: true } | ParseError;

// Return type for validate()
export type ValidationResult = {
  cdef: JSONParseResult;
  bindings: JSONParseResult;
  javascript: JavaScriptValidationResult;
  valid: boolean;
};

export default function validateComponent(
  localCDef: string,
  localBindings: string,
  localJavaScript: string
): ValidationResult {
  const cdefResults = safeParseJSON(localCDef);
  const bindingsResults = safeParseJSON(localBindings);
  const jsResults = validateJavaScript(
    localJavaScript.replace("import", "// import")
  );

  return {
    cdef: cdefResults,
    bindings: bindingsResults,
    javascript: jsResults,
    valid: cdefResults.success && bindingsResults.success && jsResults.success,
  };
}

function safeParseJSON(str: string): JSONParseResult {
  try {
    const parsed = JSON.parse(str);
    return { success: true, data: parsed };
  } catch (error: any) {
    return { success: false, error: error.message || "Invalid JSON" };
  }
}

function validateJavaScript(code: string): JavaScriptValidationResult {
  try {
    new Function(code);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Invalid JavaScript" };
  }
}
