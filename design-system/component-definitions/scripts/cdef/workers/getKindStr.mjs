import { SyntaxKind } from "ts-morph";

export default function getKindStr(obj) {
    return SyntaxKind[obj.getKind()];
}