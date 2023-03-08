/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { SearchService } from '../../core/SearchService';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { SearchContext } from '../../core';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';

class Component extends AbstractMarkoComponent<ComponentState> {

    private currentSearch: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.state.loadNodes = this.load.bind(this);
    }

    public async load(): Promise<TreeNode[]> {
        const bookmarks = await SearchService.getInstance().getSearchBookmarks();
        const nodes = bookmarks.map((b) => new TreeNode(b.actionData.id, b.title, b.icon));

        const context = ContextService.getInstance().getActiveContext<SearchContext>();
        const cache = context?.getSearchCache();
        const currentNode = nodes.find((n) => n.id === cache?.id);
        if (currentNode) {
            currentNode.selected = true;
            this.currentSearch = currentNode.id;
            this.state.name = currentNode.label;
        } else {
            this.currentSearch = null;
        }

        return nodes;
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Title', 'Translatable#Search', 'Translatable#Cancel', 'Translatable#Save',
            'Translatable#Search Title'
        ]);
    }

    public nodesChanged(nodes: TreeNode[]): void {
        this.currentSearch = nodes && nodes.length ? nodes[0].id : null;
    }

    public nameChanged(event: any): void {
        this.state.name = event && event.target && event.target.value !== '' ? event.target.value : null;
    }

    public async keyPressed(event: any): Promise<void> {
        if (event.key === 'Enter') {
            this.closeOverlay(true);
        }
    }

    public inputClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
    }

    public async closeOverlay(save: boolean = false): Promise<void> {
        if (save) {
            if (!this.state.name) {
                this.state.nameInvalid = true;
            } else {
                this.state.nameInvalid = false;

                const context = ContextService.getInstance().getActiveContext<SearchContext>();
                await context?.saveCache(this.state.name);
                BrowserUtil.openSuccessOverlay('Translatable#Search successfully saved.');

                EventService.getInstance().publish(ContextEvents.CONTEXT_DISPLAY_TEXT_CHANGED, context);

                (this as any).emit('closeOverlay');
            }
        } else {
            (this as any).emit('closeOverlay');
        }
    }

}

module.exports = Component;
