export type ModelBindings = {
  modelId: string;
  views: BindingView[];
};

export type BindingView = {
  id: string;
  default?: boolean;
  bindings: Binding[];
};

export type Binding =
  | { model: string; view: string }
  | { model: string; view: [string, (prop: string, context: any) => string] }
  | { model: string; view: { replace: boolean } }
  | { model: string; view: { slot: string } };
