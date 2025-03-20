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
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { SearchSocketClient } from '../../core/SearchSocketClient';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { SearchCache } from '../../../model/SearchCache';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { SearchService } from '../../core/SearchService';
import { SearchContext } from '../../core/SearchContext';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { SearchEvent } from '../../../model/SearchEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { SortUtil } from '../../../../../model/SortUtil';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: SearchContext;
    private objectType: KIXObjectType | string;
    private subscriber: IEventSubscriber;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        return;
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();

        this.objectType = this.context?.descriptor?.kixObjectTypes?.length > 0
            ? this.context?.descriptor?.kixObjectTypes[0]
            : KIXObjectType.ANY;

        this.loadSearches();

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: any, eventId: string): void => {
                setTimeout(() => this.loadSearches(), 500);
            }
        };

        EventService.getInstance().subscribe(SearchEvent.SAVE_SEARCH_FINISHED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(SearchEvent.SAVE_SEARCH_FINISHED, this.subscriber);
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
        this.setActiveNode();

        EventService.getInstance().publish(SearchEvent.SHOW_CRITERIA);
    }

}

module.exports = Component;