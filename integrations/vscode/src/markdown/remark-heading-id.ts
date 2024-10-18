import type { Root } from 'mdast';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';

/**
 *
 * @see https://github.com/imcuttle/remark-heading-id/blob/master/index.js
 */
export default function remarkHeadingId(): Transformer<Root> {
  return (tree) => {
    visit(tree, 'heading', (node, index, parent) => {
      const lastChild = node.children.at(-1);
      if (lastChild && lastChild.type === 'text') {
        const match = lastChild.value.match(/\s*{#(.+)}\s*$/);
        if (match && match[1].length > 0) {
          node.data ??= {};
          node.data.hProperties ??= {};
          node.data.hProperties.id = match[1];
          lastChild.value = lastChild.value.slice(0, match.index);
          return;
        }
      }
    });
  };
}
