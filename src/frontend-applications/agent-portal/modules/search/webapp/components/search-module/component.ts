/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { SearchContext } from '../../core/SearchContext';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private context: SearchContext;
    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext<SearchContext>();
        const searchCache = this.context?.getSearchCache();

        await this.initContentWidgets();

        this.state.prepared = true;
    }

    private async initContentWidgets(): Promise<void> {
        this.state.contentWidgets = await this.context?.getContent();
    }
}

module.exports = Component;
