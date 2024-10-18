import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import html from 'rehype-stringify';
import markdown from 'remark-parse';
import remark2rehype from 'remark-rehype';
import { unified } from 'unified';
import remarkHeadingId from './remark-heading-id';

describe('remark-heading-id', () => {
  test('should work', async () => {
    await parse(`# Hello World`).then((html) => {
      assert.equal(html, '<h1>Hello World</h1>');
    });
    await parse(`# Hello World{#foo}`).then((html) => {
      assert.equal(html, '<h1 id="foo">Hello World</h1>');
    });
    await parse(`# Hello World {#foo}`).then((html) => {
      assert.equal(html, '<h1 id="foo">Hello World</h1>');
    });
    await parse(`# Hello World  {#foo}  `).then((html) => {
      assert.equal(html, '<h1 id="foo">Hello World</h1>');
    });
    await parse(`# Hello *World*{#foo}`).then((html) => {
      assert.equal(html, '<h1 id="foo">Hello <em>World</em></h1>');
    });
  });
});

function parse(markdownSourceCode: string): Promise<string> {
  return unified()
    .use(markdown)
    .use(remarkHeadingId)
    .use(remark2rehype)
    .use(html)
    .process(markdownSourceCode)
    .then(data => data.toString());
}
