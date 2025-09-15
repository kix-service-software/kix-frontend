/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { SearchContext } from '../../core/SearchContext';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState, SearchContext> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        await this.initContentWidgets();
        this.state.prepared = true;
    }

    private async initContentWidgets(): Promise<void> {
        this.state.contentWidgets = await this.context?.getContent();
    }
}

module.exports = Component;
