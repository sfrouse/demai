import { Entry } from "contentful";

export default function entryToAI(entry: Entry | undefined): {
    id: string;
    contentTypeId: string;
    fields: { id: string; value: any }[];
} {
    if (!entry) {
        return {
            id: "",
            contentTypeId: "",
            fields: [],
        };
    }

    const contentTypeId = entry.sys.contentType.sys.id;

    const fieldList = Object.entries(entry.fields).map(
        ([fieldId, fieldValue]) => ({
            id: fieldId,
            value: fieldValue, // or entry.sys.locale if dynamic
        }),
    );

    return {
        id: entry.sys.id,
        contentTypeId,
        fields: fieldList,
    };
}
