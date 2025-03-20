/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IBookmarkListener } from './IBookmarkListener';
import { Bookmark } from '../../../../model/Bookmark';

export class BookmarkService {

    private static INSTANCE: BookmarkService;

    public static getInstance(): BookmarkService {
        if (!BookmarkService.INSTANCE) {
            BookmarkService.INSTANCE = new BookmarkService();
        }
        return BookmarkService.INSTANCE;
    }

    private constructor() { }

    private bookmarks: Map<string, Bookmark[]> = new Map();

    private listener: IBookmarkListener[] = [];

    public registerListener(listener: IBookmarkListener): void {
        if (!this.listener.some((l) => l.id === listener.id)) {
            this.listener.push(listener);
        }
    }

    public removeListener(id: string): void {
        const index = this.listener.findIndex((l) => l.id === id);
        if (index !== -1) {
            this.listener.splice(index, 1);
        }
    }

    public publishBookmarks(category: string, bookmarks: Bookmark[]): void {
        this.bookmarks.set(category, bookmarks);
        this.listener.forEach((l) => l.bookmarksChanged(category));
    }

    public getBookmarks(category?: string): Bookmark[] {
        let bookmarks = [];
        if (category && this.bookmarks.has(category)) {
            bookmarks = this.bookmarks.get(category);
        } else {
            const iterator = this.bookmarks.entries();
            let entry = iterator.next();
            while (entry && entry.value) {
                bookmarks = [...bookmarks, ...entry.value[1]];
                entry = iterator.next();
            }
        }

        return bookmarks;
    }

}
