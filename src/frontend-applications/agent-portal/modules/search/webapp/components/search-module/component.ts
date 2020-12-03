/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../model/IdService';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ContextMode } from '../../../../../model/ContextMode';
import { SearchService } from '../../core/SearchService';
import { SearchContext } from '../../core';

class Component {

    public listenerId: string;
    public constexServiceListenerId: string;

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
        this.listenerId = 'kix-search-module-listener';
        this.constexServiceListenerId = IdService.generateDateBasedId('search-module-');
    }

    public onInput(input: any): void {
        this.state.history = input.history;
    }

    public async onMount(): Promise<void> {
        if (!SearchService.getInstance().getSearchCache()) {
            const searchContext = await ContextService.getInstance().getContext<SearchContext>(
                SearchContext.CONTEXT_ID
            );
            if (searchContext) {
                searchContext.setSearchCache(null);
            }
            ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
        }
    }
}

module.exports = Component;
