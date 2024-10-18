import { Observable, Subscription } from 'rxjs';
import * as vscode from 'vscode';

export class BaseFileSystemProvider implements vscode.FileSystemProvider {
  didChangeFile: vscode.EventEmitter<vscode.FileChangeEvent[]>;
  onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]>;

  constructor() {
    this.didChangeFile = new vscode.EventEmitter();
    this.onDidChangeFile = this.didChangeFile.event;
  }

  async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
    throw vscode.FileSystemError.NoPermissions;
  }

  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    throw vscode.FileSystemError.NoPermissions;
  }

  async writeFile(uri: vscode.Uri, content: Uint8Array, options: { readonly create: boolean; readonly overwrite: boolean; }): Promise<void> {
    throw vscode.FileSystemError.NoPermissions;
  }

  async rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { readonly overwrite: boolean; }): Promise<void> {
    throw vscode.FileSystemError.NoPermissions;
  }

  async delete(uri: vscode.Uri, options: { readonly recursive: boolean; }): Promise<void> {
    throw vscode.FileSystemError.NoPermissions;
  }

  async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
    throw vscode.FileSystemError.NoPermissions;
  }

  async createDirectory(uri: vscode.Uri): Promise<void> {
    throw vscode.FileSystemError.NoPermissions;
  }

  watch(uri: vscode.Uri, options: { readonly recursive: boolean; readonly excludes: readonly string[]; }): vscode.Disposable {
    throw vscode.FileSystemError.NoPermissions;
  }
}

export type DisposableLike = vscode.Disposable | { dispose(): any } | Subscription | Observable<any> | Disposable | Iterable<DisposableLike>;

export function toDisposable(target: DisposableLike): vscode.Disposable {
  if (target instanceof vscode.Disposable) {
    return target;
  }
  if ('dispose' in target && typeof target.dispose === 'function') {
    return vscode.Disposable.from(target);
  }
  if (target instanceof Subscription) {
    return new vscode.Disposable(() => target.unsubscribe());
  }
  if (target instanceof Observable) {
    const subscription = target.subscribe();
    return new vscode.Disposable(() => subscription.unsubscribe());
  }
  if (Symbol.dispose in target) {
    return new vscode.Disposable(() => target[Symbol.dispose]());
  }
  if (Symbol.iterator in target) {
    return vscode.Disposable.from(...[...target].map(toDisposable));
  }
  console.error(target);
  throw new Error('Not a DisposableLike!');
}

export function toEvent<T>(from: Observable<T>): vscode.Event<T> {
  return (listener) => {
    const subscription = from.subscribe(listener);
    return new vscode.Disposable(() => subscription.unsubscribe());
  };
}
