import { CDefLintResult } from "../../types";


export default function tallyErrorsForResults(lintResults: CDefLintResult) {
    lintResults.properties.map(prop => {
        if (prop.errors && prop.errors.length > 0) {
            lintResults.errors = [...lintResults.errors, ...prop.errors];
        }
    });
    lintResults.totalErrors = lintResults.errors.length;
    lintResults.valid = lintResults.totalErrors === 0;
}
