// Markdown Preview Panel by VS Code Webview
// https://code.visualstudio.com/api/extension-guides/webview
// https://github.com/microsoft/vscode-extension-samples/blob/main/webview-sample/src/extension.ts

import { compile } from '^/base/mdx';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as vscode from 'vscode';
import { DRAFT_PREVIEW_PANEL_VIEW_TYPE } from './constants';

export class DraftPreviewPanel {
  static #current?: DraftPreviewPanel;

  // 重新打开 VS Code 时，上次没有关闭的 Preview 面板将被重新恢复。为了逻辑简单我们直接销毁。
  static registerSerializer() {
    return vscode.window.registerWebviewPanelSerializer(DRAFT_PREVIEW_PANEL_VIEW_TYPE, {
      async deserializeWebviewPanel(panel: vscode.WebviewPanel, state: unknown) {
        panel.dispose();
      },
    });
  }

  static revive(panel: vscode.WebviewPanel): void {
    DraftPreviewPanel.#current = new DraftPreviewPanel(panel);
  }

  static get current() {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
    DraftPreviewPanel.#current ??= new DraftPreviewPanel(vscode.window.createWebviewPanel(DRAFT_PREVIEW_PANEL_VIEW_TYPE, '', {
      viewColumn: vscode.ViewColumn.Beside,
      preserveFocus: true,
    }));
    return DraftPreviewPanel.#current;
  }

  #disposables: vscode.Disposable[] = [];
  #panel: vscode.WebviewPanel;

  constructor(panel: vscode.WebviewPanel) {
    this.#panel = panel;
    this.#panel.onDidDispose(() => this.#onDidDispose(), null, this.#disposables);
  }

  #onDidDispose() {
    console.log('onDidDispose');
    this.#panel.dispose();
    for (const disposable of this.#disposables) {
      disposable.dispose();
    }
    DraftPreviewPanel.#current = undefined;
  }

  #innerHtml: string = '';

  async update(context: vscode.ExtensionContext, title: string, content: string) {
    const webview = this.#panel.webview;

    this.#panel.title = title;

    webview.options = {
      enableScripts: true,
      localResourceRoots: [
        context.extensionUri,
      ],
    };

    const { MDXContent } = await compile(content ?? '# ERROR');
    this.#innerHtml = renderToStaticMarkup(createElement(MDXContent));
    this.refresh(context);
  }

  refresh(context: vscode.ExtensionContext) {
    console.log('refresh webview.');
    const nonce = getNonce();
    const cspSource = this.#panel.webview.cspSource;
    // <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource}; script-src 'nonce-${nonce}';">

    const styleUri = this.#panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'main.css'));
    // const scriptUri = this.#panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'main.js'));
    // <script nonce="${nonce}" src="${scriptUri}"></script>

    this.#panel.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleUri}" rel="stylesheet">
        <title>${Math.random()}</title>
      </head>
      <body>
        <article>${this.#innerHtml}</article>
      </body>
      </html>
    `;
  }
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
