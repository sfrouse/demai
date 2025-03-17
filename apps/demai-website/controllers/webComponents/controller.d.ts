import { Entry } from "contentful";
import { LitElement } from "lit";

// Helper type to extract the class name (or use contentType id as identifier)
type ExtractClassName<T> = T extends {
  sys: { contentType: { sys: { id: infer Id } } };
}
  ? Id
  : never;

type EntryNamePropertyString<TEntryBase> =
  `${ExtractClassName<TEntryBase>}.${Extract<keyof TEntryBase["fields"], string>}`;

type ComponentNamePropertyString<TWebCompBase, TTag> =
  `${TTag}.${Extract<keyof TWebCompBase, string>}`;

type WebCompMap2<
  T1 extends Entry<any>,
  T2 extends LitElement,
  TTag extends string,
> = {
  // eslint-disable-next-line no-unused-vars
  [Key in `${EntryNamePropertyString<T1>}`]?:
    | ComponentNamePropertyString<T2, TTag>
    | [
        ComponentNamePropertyString<T2, TTag>,
        // eslint-disable-next-line no-unused-vars
        (prop: string, context: any) => any,
      ]
    | { replace: true }
    | { slot: string };
};

export type EntryToWebCompController<
  TEntryBase extends Entry<any>,
  TWebCompBase extends LitElement,
  TTag extends string,
> = {
  tag: TTag;
  mappings?: WebCompMap2<TEntryBase, TWebCompBase, TTag>;
};
