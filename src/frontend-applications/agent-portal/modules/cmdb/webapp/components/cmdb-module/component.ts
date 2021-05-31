/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { CMDBContext } from '../../core';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext() as CMDBContext;
        this.state.contentWidgets = await context.getContent();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Search',
            'Translatable#Help'
        ]);

        this.state.placeholder = await TranslationService.translate('Translatable#Please enter a search term.');
        this.state.filterValue = context.filterValue;
    }

    public keyUp(event: any): void {
        this.state.filterValue = event.target.value;
        if (event.key === 'Enter') {
            this.search();
        }
    }

    public async search(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context instanceof CMDBContext) {
            context.setFilterValue(this.state.filterValue);
        }
    }

}

module.exports = Component;
