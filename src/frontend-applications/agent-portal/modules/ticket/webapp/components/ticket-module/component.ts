/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TicketContext } from '../../core';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext() as TicketContext;
        this.state.contentWidgets = await context.getContent();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Search',
            'Translatable#Help'
        ]);

        this.state.placeholder = await TranslationService.translate('Translatable#Please enter a search term.');
        this.state.filterValue = context?.filterValue;
    }

    public keyUp(event: any): void {
        this.state.filterValue = event.target.value;
        if (event.key === 'Enter') {
            this.search();
        }
    }

    public async search(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context instanceof TicketContext) {
            context.setFilterValue(this.state.filterValue);
        }
    }

}

module.exports = Component;
