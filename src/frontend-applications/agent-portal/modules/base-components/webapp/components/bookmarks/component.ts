/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TreeHandler, TreeService, TreeNode } from '../../core/tree';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { Bookmark } from '../../../../../model/Bookmark';
import { BookmarkService } from '../../../../../modules/base-components/webapp/core/BookmarkService';
import {
    AuthenticationSocketClient
} from '../../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { SortOrder } from '../../../../../model/SortOrder';
import { SortUtil } from '../../../../../model/SortUtil';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';

class Component {

    private state: ComponentState;

    private treeHandler: TreeHandler;

    private bookmarks: Bookmark[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.treeHandler = new TreeHandler([]);
        TreeService.getInstance().registerTreeHandler(this.state.treeId, this.treeHandler);

        this.state.placeholder = await TranslationService.translate('Translatable#Bookmarks');

        BookmarkService.getInstance().registerListener({
            id: 'bookmark-dropdown',
            bookmarksChanged: this.bookmarksChanged.bind(this)
        });

        await this.bookmarksChanged();
        this.state.prepared = true;
    }

    public onDestroy(): void {
        BookmarkService.getInstance().removeListener('bookmark-dropdown');
    }

    private async bookmarksChanged(): Promise<void> {
        const availableBookmarks = [];
        this.bookmarks = BookmarkService.getInstance().getBookmarks();
        for (const b of this.bookmarks) {
            if (await AuthenticationSocketClient.getInstance().checkPermissions(b.permissions)) {
                const bookmarkTitle = await TranslationService.translate(b.title);
                availableBookmarks.push(new TreeNode('bookmark-' + b.title, bookmarkTitle, b.icon, undefined, undefined,
                    undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                    bookmarkTitle));
            }
        }
        availableBookmarks.sort((a, b) => SortUtil.compareString(a, b, SortOrder.UP));
        this.treeHandler.setTree(availableBookmarks);
    }

    public async nodesChanged(nodes: TreeNode[]): Promise<void> {
        if (nodes && nodes.length) {
            const bookmark = this.bookmarks ? this.bookmarks.find((b) => nodes[0].id === 'bookmark-' + b.title) : null;
            if (bookmark) {
                const actions = await ActionFactory.getInstance().generateActions(
                    [bookmark.actionId], bookmark.actionData
                );

                if (actions && actions.length) {
                    if (actions[0].canRun()) {
                        actions[0].run(null);
                    }
                }

                this.treeHandler.setSelection(this.treeHandler.getSelectedNodes(), false);
            }
        }
    }

}

module.exports = Component;
