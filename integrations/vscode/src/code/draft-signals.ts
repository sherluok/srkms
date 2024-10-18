import { Subject } from 'rxjs';

export type DraftId = string;

export const didDraftTreeItemChange = new Subject<void>();

export const didDraftFileSystemWrite = new Subject<DraftId>();

export const didPostChangeActiveTextEditor = new Subject<DraftId>();
