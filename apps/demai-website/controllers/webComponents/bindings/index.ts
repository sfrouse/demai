import dmoButtonViewBindings from "./dmoButtonViewBindings";
import dmoPageViewBindings from "./dmoPageViewBindings";
import { ModelBindings } from "./types";
import setBindings from "./utils/setBindings";

const bindings: { [key: string]: ModelBindings } = {
  dmoButtonView: dmoButtonViewBindings,
  demAiPageView: dmoPageViewBindings,
};

setBindings(bindings);

export default bindings;
