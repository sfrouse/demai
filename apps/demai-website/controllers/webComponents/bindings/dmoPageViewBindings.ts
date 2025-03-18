import createLinkFromSlug from "../utils/createLinkFromSlug";
import { ModelBindings } from "./types";

const dmoPageViewBindings: ModelBindings = {
  modelId: "demAiPageView",
  views: [
    {
      id: "dmo-page",
      default: true,
      bindings: [
        { model: "title", view: "title" },
        {
          model: "body",
          view: {
            slot: "default",
          },
        },
      ],
    },
    {
      id: "dmo-button",
      bindings: [
        { model: "title", view: "label" },
        { model: "slug", view: ["url", createLinkFromSlug] },
      ],
    },
  ],
};

export default dmoPageViewBindings;
