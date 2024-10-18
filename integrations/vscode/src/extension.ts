import { merge } from 'rxjs';
import * as vscode from 'vscode';
import { PrismaClient } from '../.prisma/client';
import { DisposableLike, toDisposable } from './base/vscode';
import { DRAFT_FILE_SYSTEM_SCHEME } from './code/constants';
import { DraftExplorer } from './code/draft-explorer';
import { DraftFileSystemProvider } from './code/draft-file-system-provider';
import { DraftPreviewPanel } from './code/draft-previewer-panel';
import { didDraftFileSystemWrite, didPostChangeActiveTextEditor } from './code/draft-signals';

export async function activate(context: vscode.ExtensionContext) {
	for await (const disposableLike of initialize(context)) {
		context.subscriptions.push(toDisposable(disposableLike));
	}
}

async function* initialize(context: vscode.ExtensionContext): AsyncGenerator<DisposableLike> {
	console.log('Congratulations, your extension "helloworld-sample" is now active!');
	vscode.window.showInformationMessage('Congratulations, your extension "helloworld-sample" is now active!');

	const prisma = await findPrismaClient();
	if (!prisma) {
		vscode.window.showWarningMessage('No Prisma Client!');
		return;
	} else {
		yield new vscode.Disposable(() => prisma.$disconnect());
	}

	const draftFileSystemProvider = new DraftFileSystemProvider(prisma);
	yield draftFileSystemProvider.register();

	const draftExplorer = new DraftExplorer(prisma);
	yield draftExplorer.register();

	yield DraftPreviewPanel.registerSerializer();

	// 监听文本编辑器被打开
	yield vscode.window.onDidChangeActiveTextEditor((editor) => {
		if (editor && editor.document.uri.scheme === DRAFT_FILE_SYSTEM_SCHEME) {
			didPostChangeActiveTextEditor.next(editor.document.uri.authority);
		}
	});

	// 如果之前没有 Draft 文本编辑器被打开，现在打开了一个；
	// 或者激活了已经打开的 Draft 文本编辑器；
	// 或者当前激活的 Draft 的内容发生了变化；
	// 那么如果先前没有 Preview 面板，就创建一个新的；
	// 否则使用现有的 Preview 面板，但将其标题和内容对应到当前激活的 Draft。
	yield merge(
		didPostChangeActiveTextEditor,
		didDraftFileSystemWrite,
	).subscribe(async (id) => {
		console.log('Create/Update Post Preview Panel', id);
		try {
			// Todo: 此处应该使用缓存，因为该处的逻辑的触发将会非常频繁，不能每次都去
			// 查询数据库，因为可能是通过 HTTP 调用很远的服务器上的数据库服务。
			const draft = await prisma.draft.findUnique({ where: { id } });
			if (!draft) {
				vscode.window.showErrorMessage(`Draft "${id}" not found!`);
				return;
			}
			DraftPreviewPanel.current.update(context, 'Title Generation TODO', draft.content);
		} catch (error) {
			console.error(error);
		}
	});
}

async function findPrismaClient(): Promise<undefined | PrismaClient> {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showWarningMessage('No workspace folder!');
		return;
	}
	for (const folder of vscode.workspace.workspaceFolders) {
		console.log(folder.name, folder.uri.fsPath);
		const dbFilePath = vscode.Uri.joinPath(folder.uri, '.srkms', 'db.sqlite');
		try {
			const stats = await vscode.workspace.fs.stat(dbFilePath);
			console.log('db file exists:', dbFilePath.toString(), stats);
			const prisma = new PrismaClient({
				datasourceUrl: `file:${dbFilePath.fsPath}`,
			});
			const drafts = await prisma.draft.findMany();
			if (drafts.length === 0) {
				vscode.window.showInformationMessage('Creatng the initail draft...');
				await prisma.draft.create({
					data: {
						content: '# Your First Draft\n\nHello World!',
					},
				});
			}
			return prisma;
		} catch (error) {
			console.error(error);
			vscode.window.showErrorMessage(String(error));
		}
	}
}
