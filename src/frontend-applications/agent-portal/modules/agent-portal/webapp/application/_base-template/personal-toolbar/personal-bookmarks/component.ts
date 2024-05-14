/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Bookmark } from '../../../../../../../model/Bookmark';
import { AbstractMarkoComponent } from '../../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ActionFactory } from '../../../../../../base-components/webapp/core/ActionFactory';
import { AuthenticationSocketClient } from '../../../../../../base-components/webapp/core/AuthenticationSocketClient';
import { BookmarkService } from '../../../../../../base-components/webapp/core/BookmarkService';
import { TranslationService } from '../../../../../../translation/webapp/core/TranslationService';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private bookmarks: Bookmark[] = [];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.bookmarks = [];
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Favorites'
        ]);

        BookmarkService.getInstance().registerListener({
            id: 'personal-bookmarks',
            bookmarksChanged: this.bookmarksChanged.bind(this)
        });

        await this.bookmarksChanged();

    }

    private async bookmarksChanged(): Promise<void> {
        const availableBookmarks: Bookmark[] = [];
        const bookmarks = [...BookmarkService.getInstance().getBookmarks()];
        for (const b of bookmarks) {
            if (await AuthenticationSocketClient.getInstance().checkPermissions(b.permissions)) {
                b.title = await TranslationService.translate(b.title);
                availableBookmarks.push(b);
            }
        }
        this.bookmarks = availableBookmarks;
        this.state.bookmarksCount = this.bookmarks.length;

        this.initBookmarkGroups();
    }

    private initBookmarkGroups(): void {
        const groups: string[] = [];
        for (const b of this.bookmarks) {
            if (!groups.some((g) => g === b.group)) {
                groups.push(b.group);
            }
        }

        groups.sort((a, b) => a.localeCompare(b));
        this.state.groups = groups;
    }

    public async bookmarkClicked(bookmark: Bookmark): Promise<void> {
        if (bookmark) {
            const actions = await ActionFactory.getInstance().generateActions(
                [bookmark.actionId], bookmark.actionData
            );

            if (actions && actions.length) {
                if (actions[0].canRun()) {
                    actions[0].run(null);
                }
            }
        }
    }

    public getBookmarks(group: string): Bookmark[] {
        return this.bookmarks.filter((b) => b.group === group);
    }
}

module.exports = Component;
