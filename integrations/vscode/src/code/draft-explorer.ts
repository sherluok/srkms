// Post Explorer
// VS Code tree view int primary sidebar explorer container,

import { Draft, PrismaClient } from '^/base/client';
import * as vscode from 'vscode';
import { DRAFT_EXPLOERE_VIEW_ID } from './constants';
import { DraftFileSystemProvider } from './draft-file-system-provider';

// which is used to show the drafts in database.
export class DraftExplorer implements vscode.TreeDataProvider<Draft> {
  constructor(private client: PrismaClient) {}

  register() {
    return vscode.window.createTreeView(DRAFT_EXPLOERE_VIEW_ID, {
      treeDataProvider: this,
    });
  }

  async getChildren(element?: Draft): Promise<Draft[]> {
    if (element) {
      return [];
    }
    return await this.client.draft.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTreeItem(element: Draft): Promise<vscode.TreeItem> {
    const title = 'This should be the title';
    const resourceUri = DraftFileSystemProvider.toUri({
      id: element.id,
      title,
    });
    return {
      id: element.id,
      label: title,
      resourceUri,
      command: {
        title: 'Open Draft',
        command: 'vscode.open',
        arguments: [resourceUri],
      },
    };
  }
}
