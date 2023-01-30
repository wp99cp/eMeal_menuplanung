import mermaid from "mermaid";
import mindmap from "@mermaid-js/mermaid-mindmap";

const init = (async () => {
  try {
    await mermaid.registerExternalDiagrams([mindmap]);
  } catch (e) {
    console.error(e);
  }
})();

export const render = async (id, code, config) => {
  await init;
  mermaid.initialize(config);
  return await mermaid.renderAsync(id, code);
};
