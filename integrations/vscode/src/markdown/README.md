
- [CommonMark Spec](https://spec.commonmark.org/current/)
- [Markdown Basic Syntax](https://www.markdownguide.org/basic-syntax/) ^557d26
- [Markdown Extended Syntax](https://www.markdownguide.org/extended-syntax/)

- [HTML Character reference](https://developer.mozilla.org/en-US/docs/Glossary/Character_reference)
- [VS Code Markdown](https://code.visualstudio.com/docs/languages/markdown)
- [VS Code Doc Writer Profile Template](https://code.visualstudio.com/docs/editor/profiles#_doc-writer-profile-template)
- [Markdown Definition Lists](https://www.markdownguide.org/extended-syntax/#definition-lists) 以及对应的 HTML [`<dl>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl) ，[`<dt>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dt)，[`<dd>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dd) 和 [`<dfn>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dfn) 标签。
- [MDN Web 文档项目](https://developer.mozilla.org/zh-CN/docs/MDN) > [撰写指南](https://developer.mozilla.org/zh-CN/docs/MDN/Writing_guidelines) > [文档结构](https://developer.mozilla.org/zh-CN/docs/MDN/Writing_guidelines/Page_structures) > [使用宏](https://developer.mozilla.org/zh-CN/docs/MDN/Writing_guidelines/Page_structures/Macros)

MDX

- [Architecture](https://mdxjs.com/packages/mdx/#architecture)

W3C

- [Bikeshed, a spec preprocessor](https://github.com/speced/bikeshed)
- [markdown-to-spec](https://github.com/w3c-ccg/markdown-to-spec)

GitHub

- [VS  Code Markdown Extension](https://code.visualstudio.com/api/extension-guides/markdown-extension)
- https://github.com/mjbvz/vscode-github-markdown-preview-style/blob/master/package.json
- https://github.com/mjbvz/vscode-markdown-mermaid/blob/master/package.json
- https://github.com/mdx-js/mdx-analyzer/blob/main/packages/vscode-mdx/package.json


First Term
: This is the definition of the first term.

Second Term
: This is one definition of the second term.
: This is another definition of the second term.


## 项目 SRKMS

**SRKMS** (Sherluok's Relational Knowledge Management System) 类似 [Obsidian](https://help.obsidian.md/) 是一个知识库管理工具，能够写文档、维护关系、自动管理图片资源。下面是它的功能的详细列表：
- 资源管理：自动上传图片、视频、PDF文件等资源到指定的对象存储或本地文件系统中。
- 丰富的语法：扩展 Markdown 语法、Latex 语法、MDX，还可以基于 AST 自定义语法。
- 自定义样式和组件：通过 CSS 样式文件、Unicast 的 AST 自定义编译脚本、MDX 的 TSX 组件、目标环境等配置自定义渲染结果。
- 发布到互联网：服务端渲染、SEO 优化、缓存、多种内建免费云服务商目标。
- 多语言翻译系统：
- 使用 VS Code 编辑器作为用户界面：代码高亮、提示、重构。
- 云同步：默认使用本地的 SQLite 数据库，但可以选择 Cloudflare D1、Github 等云数据库服务。
- 备份：自定义备份逻辑。
- 结构：可以将一系列文章集合起来成文一个系列，常常用于发布到互联网。

### 扩展的 Markdown 语法

- 标题（`#`，`##`，...）会渲染为一个锚点，且标题文字前面会自动加上一个 `§` 字符，并且该字符是链接到该标题锚点。锚点的 ID 默认使用标题文字生成，但也可以通过在标题文字后面添加 `{#anchor}` 来自定义锚点 ID。例如：

	```markdown
	## 我是一个标题 {#i-am-a-title}
	```

- 定义列表通过术语、换行、冒号、空格来创建，对应 HTML 的 [`<dl>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl) ，[`<dt>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dt)，[`<dd>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dd) 以及 [`<dfn>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dfn) 标签。术语将被自动添加 ID，但可以通过 `{#id}` 来自定义。例如：

	```markdown
	First Term
	: This is the definition of the first term.

	Second Term
	: This is one definition of the second term.
	: This is another definition of the second term.
	```

- 通过 `[[文章名#标题名]]` 可以引用系统内的其它文章、标题、术语等。文章名和标题名是为了可读性，但最后编译器都会转换为 ID，或者在它们不存在时提示编译失败。在编辑器中键入 `[[` 两个字符，然后从弹出的列表中选择要链接到文件名称，最后得到的源码是 `[[My Another Note.md]]`。
	- `[[My Another Note.md]]`
	- `[[Figure 1.png]]`
	- `[[#Some Internal Title of Current Note]]`
	- `[[My Another Note.md#Some Header Title]]`
	- `[[My Another Note.md#Some Header Title#Some Sublevel Title]]`
	- `Block identifier example  ^37066d`
	- `[[2023-01-01#^37066d]]`
	- `[[#Some Internal Title of Current Note|Custom Display Text]]`

