/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { OrganisationContext } from '../../core/context/OrganisationContext';

class Component {

    public state: ComponentState;
    private context: OrganisationContext;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext() as OrganisationContext;
        this.state.contentWidgets = await this.context.getContent();

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Search',
            'Translatable#Help'
        ]);

        this.state.placeholder = await TranslationService.translate(
            'Translatable#Please enter a search term for a organisation.'
        );
        this.state.filterValue = this.context.filterValue;
    }

    public keyUp(event: any): void {
        this.state.filterValue = event.target.value;
        if (event.key === 'Enter') {
            this.search();
        }
    }

    public async search(): Promise<void> {
        this.context.setFilterValue(this.state.filterValue);
    }

}

module.exports = Component;
