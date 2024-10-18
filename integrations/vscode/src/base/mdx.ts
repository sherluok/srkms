import * as mdx from '@mdx-js/mdx';
import withToc from '@stefanprobst/rehype-extract-toc';
import withTocExport from '@stefanprobst/rehype-extract-toc/mdx';
import { type MDXContent } from 'mdx/types';
import * as runtime from 'react/jsx-runtime';
import rehypePrettyCode from "rehype-pretty-code";
import withSlugs from 'rehype-slug';
import remarkGfm from 'remark-gfm';

type CompileResult = {
  MDXContent: MDXContent;
  tableOfContents: TocNode[];
}

export type TocNode = {
  depth: number;
  id: string;
  value: string;
  children?: TocNode[];
};

export async function compile(sourceText: string): Promise<CompileResult> {
  const file = await mdx.compile(sourceText, {
    outputFormat: 'function-body',
    remarkPlugins: [
      remarkGfm,
    ],
    rehypePlugins: [
      withSlugs,
      withToc,
      withTocExport,
      [rehypePrettyCode, {
        // https://rehype-pretty.pages.dev/#mdx
        // https://github.com/rehype-pretty/rehype-pretty-code/blob/master/docs/src/content/docs/index.mdx
        // https://github.com/shikijs/textmate-grammars-themes/blob/main/packages/tm-themes/themes/github-dark-dimmed.json
        keepBackground: false,
        defaultLang: {
          block: 'plaintext',
        },
      }],
    ],
  });

  const module = await mdx.run(file, {
    ...runtime,
    // outputFormat: 'function-body',
  } as any);

  console.log(module);

  return {
    MDXContent: module.default,
    tableOfContents: module.tableOfContents as TocNode[],
  };
}
