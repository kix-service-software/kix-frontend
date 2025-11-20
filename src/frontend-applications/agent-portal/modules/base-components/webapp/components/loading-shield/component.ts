/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ApplicationEvent } from '../../core/ApplicationEvent';
import { LoadingShieldEventData } from '../../core/LoadingShieldEventData';

class Component extends AbstractMarkoComponent<ComponentState> {

    private shieldId: string;

    public onCreate(input: any): void {
        super.onCreate(input, 'loading-shield');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.shieldId = input.shieldId;
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        super.registerEventSubscriber(
            function (data: LoadingShieldEventData, eventId: string): void {
                if (data.shieldId === this.shieldId) {
                    this.state.show = data.isLoading;
                    this.state.hint = data.loadingHint;
                    this.state.cancelButtonText = data.cancelButtonText;
                    this.state.cancelCallback = data.cancelCallback;
                    this.state.time = data.time;
                    this.update();
                }
            },
            [ApplicationEvent.TOGGLE_LOADING_SHIELD]
        );
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    public async update(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Cancel', 'Translatable#Save'
        ]);

        if (this.state.cancelButtonText) {
            this.state.cancelButtonText = await TranslationService.translate(this.state.cancelButtonText);
        }
    }

    public cancel(): void {
        if (this.state.cancelCallback) {
            this.state.cancelCallback();
        }
    }

}

module.exports = Component;
