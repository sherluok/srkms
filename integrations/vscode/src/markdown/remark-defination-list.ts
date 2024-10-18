import type { Root } from 'mdast';
import html from 'rehype-stringify';
import markdown from 'remark-parse';
import remark2rehype from 'remark-rehype';
import type { Transformer } from 'unified';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

/**
 *
 * @see https://github.com/Symbitic/remark-plugins/blob/master/packages/remark-deflist/src/index.ts
 */
export default function remarkDefinationList(): Transformer<Root> {
  return (tree) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      console.log(node.children);
      return;
    });
  };
}

function parse(markdownSourceCode: string): Promise<string> {
  return unified()
    .use(markdown)
    .use(remarkDefinationList)
    .use(remark2rehype)
    .use(html)
    .process(markdownSourceCode)
    .then(data => data.toString());
}

parse(`
# Hello World {#okk}

[foo]: /url "title"

[foo]

I am a paragraph.
First **Term**
: This is the definition of the first term.
Second Term
: This is one definition of the second term.
: This is another definition of the second term.

`).then(console.log).catch(console.error);


// /**
//  * Detect metadata and add it to the `data` field of a VFile.
//  */
// import { visit } from 'unist-util-visit';
// import { toString } from 'mdast-util-to-string';
// import { fromMarkdown } from 'mdast-util-from-markdown';
// import { toMarkdown } from 'mdast-util-to-markdown';
// import type { Transformer } from 'unified';
// import type { Node } from 'unist';
// import type { Parent } from 'mdast';

// // Test if deflist is contained in a single paragraph.
// const isSingleDeflist = (node: Node) =>
//   // i > 0 &&
//   /^[^:].+\n:\s/.test(toString(node)) &&
//   node.type === 'paragraph'

// // Test if deflist is split between two paragraphs.
// const isSplitDeflist = (node: Node, i: number, parent: Parent) =>
//   i > 0 &&
//   /^:\s/.test(toString(node)) &&
//   !/^:\s/.test(toString(parent.children[i - 1])) &&
//   node.type === 'paragraph' &&
//   parent.children[i - 1].type === 'paragraph'

// const isdeflist = (node: Node, i: number, parent: Parent) => isSingleDeflist(node) || isSplitDeflist(node, i, parent)

// export default function remarkDefinationList(): Transformer {
//   return (tree) => {
//     visit(tree, ['paragraph'], (node, i, parent) => {
//       const isdef = isdeflist(node, i!, parent as Parent)
//       if (!isdef) {
//         return
//       }

//       let dd = undefined;
//       let dt = undefined;
//       let count = 0;
//       let start: number = 0;

//       if (isSingleDeflist(node)) {
//         const [ title, ...children ] = toMarkdown(node as any).split(/\n:\s+/)

//         const childs = fromMarkdown(title).children as Parent[]

//         dt = childs.flatMap(({ children }) => children)
//         dd = children
//           .map((str) => fromMarkdown(str) as Parent)
//           .flatMap(({ children }) => children)
//           .map(({ children }: any) => ({
//             type: 'descriptiondetails',
//             data: {
//               hName: 'dd'
//             },
//             children
//           }))
//         start = i as number
//         count = 1
//       } else {
//         const childs = parent!.children[i! - 1] as Parent
//         dt = childs.children
//         dd = toMarkdown(node as any)
//           .replace(/^:\s+/, '')
//           .split(/\n:\s+/)
//           .map((str) => fromMarkdown(str) as Parent)
//           .flatMap(({ children }) => children)
//           .map(({ children }: any) => ({
//             type: 'descriptiondetails',
//             data: {
//               hName: 'dd'
//             },
//             children
//           }))
//         start = i! - 1
//         count = 2
//       }

//       const child = {
//         type: 'descriptionlist',
//         data: {
//           hName: 'dl'
//         },
//         children: [
//           {
//             type: 'descriptionterm',
//             data: {
//               hName: 'dt'
//             },
//             children: dt
//           },
//           ...dd
//         ]
//       }

//       parent!.children.splice(start, count, child)
//     })

//     // Merge subsequent definition lists into a single list (#10)
//     visit(tree, ['descriptionlist'], (node, i, parent) => {
//       const start = i;
//       let count = 1;
//       let children = (node as Parent).children;

//       for (let j=i!+1; j<parent!.children.length; j++) {
//         const next = parent!.children[j] as Parent;
//         if (next.type === 'descriptionlist') {
//           count++;
//           children = children.concat(next.children);
//         } else {
//           break;
//         }
//       }

//       if (count === 1) {
//         return;
//       }

//       (node as Parent).children = children;

//       parent!.children.splice(start!, count, node);
//     });
//   }
// }
