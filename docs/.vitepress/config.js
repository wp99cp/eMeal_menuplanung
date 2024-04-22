import { defineConfig } from 'vitepress';
import MermaidRenderer from './mermaid-markdown-all';

const allMarkdownTransformers = {
  config: async (md) => {
    await MermaidRenderer(md);
  },
};

export default defineConfig({
  lang: 'en-US',

  title: 'Cevi.Tools',
  description: 'eMeal - Menüplanung',

  srcDir: './src',
  ignoreDeadLinks: 'localhostLinks',

  markdown: allMarkdownTransformers,

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/wp99cp/eMeal_menuplanung' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            {
              text: 'About the Project',
              link: '/',
            },

            {
              text: 'Getting Started',
              link: '/getting-started',
            },
            {
              text: 'Project Structure',
              link: '/project-structure',
            },
          ],
        },
        {
          text: 'Frontend',
          items: [
            {
              text: 'Frontend Architecture',
              link: '/frontend/',
            },
          ],
        },
        {
          text: 'Backend',
          items: [
            {
              text: 'GraphQL Server',
              link: '/backend/graphql',
            },
            {
              text: 'Prisma',
              link: '/backend/prisma',
            },
            {
              text: 'Postgres',
              link: '/backend/postgres',
            },
            {
              text: 'Print Server',
              link: '/backend/print-server',
            },
          ],
        },
        {
          text: 'Observability',
          items: [
            {
              text: 'Observability',
              link: '/observability/',
            },
          ],
        },
        {
          text: 'Documentation',
          items: [
            {
              text: 'Introduction',
              link: '/docs/',
            },
          ],
        },
      ],
    },
  },
});
