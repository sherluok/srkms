# SRKMS

Sherluok's Relational Knowledge Management System

## Architecture

The processor goes through these steps:
1. mdx -> mdast: serialized markdown with embedded JSX, ESM, and expressions to markdown syntax tree;
2. vscode laungage support: vscode language server protocol;
3. remark: transform through remark (markdown ecosystem);
3. mdas -> hast: transform mdast to hast (HTML syntax tree)
4. rehype: transform through rehype (HTML ecosystem)
5. hast -> esast: transform hast to esast (JS syntax tree);
6. do the work needed to get a component
7. recma: transform through recma (JS ecosystem)
8. east -> js: serialize esast as JavaScript
