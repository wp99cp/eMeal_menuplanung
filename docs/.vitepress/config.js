import { defineConfig } from "vitepress";
import MermaidRenderer from "./mermaid-markdown-all";

const allMarkdownTransformers = {
  config: async (md) => {
    await MermaidRenderer(md);
  },
};

export default defineConfig({
  lang: "en-US",

  title: "Cevi.Tools",
  description: "eMeal - Menüplanung",

  srcDir: "./src",
  ignoreDeadLinks: "localhostLinks",

  markdown: allMarkdownTransformers,

  themeConfig: {
    sidebar: {
      "/": [
        {
          text: "Introduction",
          items: [
            {
              text: "About the Project",
              link: "/",
            },

            {
              text: "Getting Started",
              link: "/getting-started",
            },
            {
              text: "Project Structure",
              link: "/project-structure",
            },
          ],
        },
        {
          text: "Documentation",
          items: [
            {
              text: "Introduction",
              link: "/docs/",
            },
          ],
        },
      ],
    },
  },
});
