/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { SearchSocketClient } from '../../core/SearchSocketClient';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { SearchCache } from '../../../model/SearchCache';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { SearchService } from '../../core/SearchService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { SearchEvent } from '../../../model/SearchEvent';
import { SortUtil } from '../../../../../model/SortUtil';
import { SearchContextConfiguration } from '../../../../../model/configuration/SearchContextConfiguration';
import { SearchContext } from '../../core/SearchContext';

export class Component extends AbstractMarkoComponent<ComponentState, SearchContext> {

    private objectType: KIXObjectType | string;

    public onCreate(input: any): void {
        super.onCreate(input, 'search-list-widget');
        this.state = new ComponentState(input.instanceId);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.objectType = this.context?.descriptor?.kixObjectTypes?.length > 0
            ? this.context?.descriptor?.kixObjectTypes[0]
            : KIXObjectType.ANY;

        this.loadSearches();

        super.registerEventSubscriber(
            function (data: any, eventId: string): void {
                if (data.instanceId !== this.contextInstanceId) return;
                if (eventId === SearchEvent.SEARCH_CACHE_CHANGED) {
                    this.setActiveNode();
                } else {
                    setTimeout(() => this.loadSearches(), 500);
                }
            },
            [
                SearchEvent.SEARCH_DELETED,
                SearchEvent.SEARCH_CACHE_CHANGED,
                SearchEvent.SAVE_SEARCH_FINISHED
            ]
        );
    }

    private async loadSearches(): Promise<void> {
        this.state.prepared = false;
        let searches = await SearchSocketClient.getInstance().loadAllSearches() || [];
        searches = searches.filter((s) => s.objectType === this.objectType);

        const userSearches = searches.filter((s) => !s.userId);
        this.state.userSearches = this.prepareNodes(userSearches);

        const sharedSearches = searches.filter((s) => s.userId);
        this.state.sharedSearches = this.prepareNodes(sharedSearches);

        this.setActiveNode();

        setTimeout(() => this.state.prepared = true, 10);
    }

    private prepareNodes(searches: SearchCache[]): TreeNode[] {
        let nodes: TreeNode[] = [];
        for (const search of searches) {
            const icon = SearchService.getInstance().getSearchIcon(this.objectType);
            const label = search.userDisplayText ? `(${search.userDisplayText}) - ${search.name}` : search.name;
            nodes.push(new TreeNode(search, label, icon));
        }

        nodes = SortUtil.sortObjects(nodes, 'label');
        return nodes;
    }

    private setActiveNode(): void {
        const searchId = this.context.getSearchCache()?.id;
        if (searchId) {
            let node = this.state.sharedSearches.find((s) => s.id?.id === searchId);
            if (!node) {
                node = this.state.userSearches.find((s) => s.id?.id === searchId);
            }

            this.state.activeNode = node;
        }
    }

    public searchClicked(node: TreeNode): void {
        node.id?.reset();
        this.context.setSearchCache(node.id);
        this.context.setSearchResult([]);

        EventService.getInstance().publish(SearchEvent.SHOW_CRITERIA, { instanceId: this.contextInstanceId });
        if ((this.context.getConfiguration() as SearchContextConfiguration).enableSidebarAutoSearch) {
            EventService.getInstance().publish(SearchEvent.CALL_SEARCH, { instanceId: this.contextInstanceId });
        }
    }


    public onDestroy(): void {
        super.onDestroy();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;