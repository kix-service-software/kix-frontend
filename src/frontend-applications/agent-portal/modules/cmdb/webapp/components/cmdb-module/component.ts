/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { CMDBContext } from '../../core';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState, CMDBContext> {

    public onCreate(input: any): void {
        super.onCreate(input, 'cmdb-module');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Search',
            'Translatable#Help'
        ]);

        this.state.placeholder = await TranslationService.translate('Translatable#Please enter a search term.');
        this.state.filterValue = this.context?.filterValue;

        this.prepareWidgets();

        super.registerEventSubscriber(
            function (data: any): void {
                if (data?.contextId === this.context.contextId) {
                    this.prepareWidgets();
                }
            },
            [ContextEvents.CONTEXT_USER_WIDGETS_CHANGED]
        );
    }

    private async prepareWidgets(): Promise<void> {
        this.state.prepared = false;
        setTimeout(async () => {
            this.state.contentWidgets = await this.context?.getContent();
            this.state.prepared = true;
        }, 100);
    }

    public keyUp(event: any): void {
        this.state.filterValue = event.target.value;
        if (event.key === 'Enter') {
            this.search();
        }
    }

    public async search(): Promise<void> {
        this.context?.setFilterValue(this.state.filterValue);
    }


    public onDestroy(): void {
        super.onDestroy();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
