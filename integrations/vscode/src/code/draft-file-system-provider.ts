// Virtual File System Provider for scheme:
// post://<draft-id>[/<title>.md]

import { Draft, PrismaClient } from '^/base/client';
import { BaseFileSystemProvider, toDisposable } from '^/base/vscode';
import { filter, tap } from 'rxjs';
import * as vscode from 'vscode';
import { DRAFT_FILE_SYSTEM_SCHEME } from './constants';
import { didDraftFileSystemWrite } from './draft-signals';

export class DraftFileSystemProvider extends BaseFileSystemProvider {
  static toUri(draft: { id: string, title: string }) {
    return vscode.Uri.from({
      scheme: DRAFT_FILE_SYSTEM_SCHEME,
      authority: draft.id,
      path: '/' + draft.title + '.mdx',
    });
  }

  constructor(private client: PrismaClient) {
    super();
  }

  register() {
    return vscode.workspace.registerFileSystemProvider(DRAFT_FILE_SYSTEM_SCHEME, this);
  }

  async fromUri(uri: vscode.Uri): Promise<Draft> {
    const id = uri.authority;
    const draft = await this.client.draft.findUnique({ where: { id } });
    if (!draft) throw vscode.FileSystemError.FileNotFound;
    return draft;
  }

  async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
    const draft = await this.fromUri(uri);
    const content = new Uint8Array(new TextEncoder().encode(draft.content));
    return {
      type: vscode.FileType.File,
      size: content.byteLength,
      ctime: +draft.createdAt,
      mtime: +draft.updatedAt,
    };
  }

  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    const draft = await this.fromUri(uri);
    const content = new Uint8Array(new TextEncoder().encode(draft.content));
    return content;
  }

  async writeFile(uri: vscode.Uri, content: Uint8Array, options: { readonly create: boolean; readonly overwrite: boolean; }): Promise<void> {
    try {
      const id = uri.authority;
      await this.client.draft.update({ where: { id }, data: { content: new TextDecoder().decode(content) } });
      didDraftFileSystemWrite.next(id);
    } catch (error) {
      console.error(error);
      throw vscode.FileSystemError.FileNotFound;
    }
  }

  watch(uri: vscode.Uri, options: { readonly recursive: boolean; readonly excludes: readonly string[]; }): vscode.Disposable {
    if (options.recursive) throw vscode.FileSystemError.NoPermissions;
    if (!uri.authority) throw vscode.FileSystemError.NoPermissions;
    return toDisposable(
      didDraftFileSystemWrite.pipe(
        filter((id) => id === uri.authority),
        tap(() => {
          console.log('fs.didChangeFile.fire({ type: Changed, uri: %s })', uri.toString());
          this.didChangeFile.fire([{ type: vscode.FileChangeType.Changed, uri }]);
        }),
      ),
    );
  }
}
