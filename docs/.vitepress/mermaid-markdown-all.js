const MermaidRenderer = async (md) => {
  const defaultRenderer = md.renderer.rules.fence;

  if (!defaultRenderer) {
    throw new Error('defaultRenderer is undefined');
  }

  md.renderer.rules.fence = (tokens, index, options, env, slf) => {
    const token = tokens[index];

    if (token.info.trim() === 'mermaid-example') {
      if (!md.options.highlight) {
        // this function is always created by vitepress, but we need to check it
        // anyway to make TypeScript happy
        throw new Error(
          'Missing MarkdownIt highlight function (should be automatically created by vitepress'
        );
      }

      // doing ```mermaid-example {line-numbers=5 highlight=14-17} is not supported
      const langAttrs = '';
      return `
      <div class='language-mermaid'>
        <button class='copy'></button>
        <span class='lang'>mermaid</span>
        ${
          // html is pre-escaped by the highlight function
          // (it also adds `v-pre` to ignore Vue template syntax)
          md.options.highlight(token.content, 'mermaid', langAttrs)
        }
      </div>`;
    } else if (token.info.trim() === 'mermaid') {
      return `
      <Suspense> 
      <template #default>
      <Mermaid id='mermaid-${index}'  graph='${encodeURIComponent(
        token.content
      )}'></Mermaid>
      </template>
        <!-- loading state via #fallback slot -->
        <template #fallback>
          Loading...
        </template>
      </Suspense>
`;
    }

    return defaultRenderer(tokens, index, options, env, slf);
  };
};

export default MermaidRenderer;
