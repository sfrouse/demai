import { ModelBindings } from "./types";

const dmoButtonViewBindings: ModelBindings = {
  modelId: "dmoButtonView",
  views: [
    {
      id: "dmo-button",
      default: true,
      bindings: [
        { model: "label", view: "label" },
        { model: "target", view: "target" },
        { model: "url", view: "url" },
        { model: "overrides", view: { replace: true } },
        { model: "children", view: { slot: "a-child" } },
      ],
    },
  ],
};

export default dmoButtonViewBindings;
