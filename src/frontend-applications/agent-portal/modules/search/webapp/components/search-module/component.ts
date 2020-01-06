/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IContextServiceListener } from "../../../../../modules/base-components/webapp/core/IContextServiceListener";
import { ComponentState } from "./ComponentState";
import { IdService } from "../../../../../model/IdService";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";
import { ContextMode } from "../../../../../model/ContextMode";
import { Context } from "vm";
import { ContextType } from "../../../../../model/ContextType";
import { SearchContext } from "../../core/SearchContext";
import { SearchService } from "../../core/SearchService";
import { CacheState } from "../../../model/CacheState";
import { ContextDescriptor } from "../../../../../model/ContextDescriptor";

class Component implements IContextServiceListener {

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

    public onMount(): void {
        if (!this.state.history) {
            ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
        }
        ContextService.getInstance().registerListener(this);
    }

    public onDestroy(): void {
        ContextService.getInstance().unregisterListener(this.constexServiceListenerId);
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
