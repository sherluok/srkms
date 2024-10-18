import html from 'rehype-stringify';
import markdown from 'remark-parse';
import remark2rehype from 'remark-rehype';
import { unified } from 'unified';
import remarkDefinationList from './remark-defination-list';

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
# Hello World
First Term
: This is the definition of the first term.

Second Term
: This is one definition of the second term.
: This is another definition of the second term.

`).then(console.log).catch(console.error);
