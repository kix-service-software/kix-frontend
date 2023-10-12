/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { EventService } from '../../core/EventService';
import { ApplicationEvent } from '../../core/ApplicationEvent';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { LoadingShieldEventData } from '../../core/LoadingShieldEventData';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;
    private shieldId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.shieldId = input.shieldId;
    }

    public async onMount(): Promise<void> {
        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('LoadingShield'),
            eventPublished: (data: LoadingShieldEventData, eventId: string): void => {
                if (data.shieldId === this.shieldId) {
                    this.state.show = data.isLoading;
                    this.state.hint = data.loadingHint;
                    this.state.cancelButtonText = data.cancelButtonText;
                    this.state.cancelCallback = data.cancelCallback;
                    this.state.time = data.time;
                    this.update();
                }
            }
        };

        EventService.getInstance().subscribe(ApplicationEvent.TOGGLE_LOADING_SHIELD, this.subscriber);
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
