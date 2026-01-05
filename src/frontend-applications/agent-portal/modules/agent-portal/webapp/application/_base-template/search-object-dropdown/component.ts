/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextMode } from '../../../../../../model/ContextMode';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { SearchService } from '../../../../../search/webapp/core/SearchService';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Create', 'Translatable#Search'
        ]);

        const descriptors = ContextService.getInstance().getContextDescriptors(ContextMode.SEARCH);
        this.state.canShow = Array.isArray(descriptors) && descriptors.length > 0;
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    public async searchClicked(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();
        this.search();
    }

    public searchInputClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
    }

    public keyDown(event: any): void {
        if (event.keyCode === 13 || event.key === 'Enter') {
            this.search();
        }
    }

    public async search(): Promise<void> {
        const element = (this as any).getEl('searchObjectInput');
        if (element?.value) {
            await SearchService.getInstance().executeUserFulltextSearch(element?.value);
        }
    }

    public searchValueChanged(event: any, externalFilterText?: string): void {
        this.state.searchValue = event ? event.target.value : externalFilterText;
    }


    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
