/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService, IContextServiceListener } from "../../../core/browser";
import { ContextMode, ContextType, Context, CacheState, ContextDescriptor } from "../../../core/model";
import { SearchContext } from '../../../core/browser/search/context/SearchContext';
import { SearchService } from '../../../core/browser/kix/search/SearchService';

class Component implements IContextServiceListener {

    public listenerId: string;

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
        this.listenerId = 'kix-search-module-listener';
    }

    public onInput(input: any): void {
        this.state.history = input.history;
    }

    public onMount(): void {
        if (!this.state.history) {
            ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
        }
        ContextService.getInstance().registerListener(this);
    }

    public contextChanged(
        contextId: string, context: Context, type: ContextType, history: boolean
    ): void {
        if (contextId === SearchContext.CONTEXT_ID && !history) {
            const cache = SearchService.getInstance().getSearchCache();
            if (cache) {
                cache.status = CacheState.INVALID;
            }

            ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
        }
    }

    public contextRegistered(descriptor: ContextDescriptor): void {
        return;
    }
}

module.exports = Component;
