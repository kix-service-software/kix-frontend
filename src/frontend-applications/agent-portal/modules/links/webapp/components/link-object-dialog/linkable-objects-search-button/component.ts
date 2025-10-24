/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { FormEvent } from '../../../../../base-components/webapp/core/FormEvent';
import { FormValuesChangedEventData } from '../../../../../base-components/webapp/core/FormValuesChangedEventData';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input, 'link-object-dialog/linkable-objects-search-button');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.translations = await TranslationService.createTranslationObject(['Translatable#Start search']);

        super.registerEventSubscriber(
            function (data: FormValuesChangedEventData, eventId: string): void {
                this.state.canSearch = data.formInstance.hasValues();
            },
            [FormEvent.VALUES_CHANGED]
        );
    }

    public executeSearch(): void {
        if (this.state.canSearch) {
            (this as any).emit('executeSearch');
        }
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
