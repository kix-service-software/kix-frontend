/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from 'mocha';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { AbstractMarkoComponent } from '../../../core/AbstractMarkoComponent';
import { ContextEvents } from '../../../core/ContextEvents';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input, 'object-dialog/dialog-notifications');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        super.registerEventSubscriber(
            async function (data: Context, eventId: string): Promise<void> {
                this.state.message = await TranslationService.translate('Translatable#draft successfully saved');
                setTimeout(() => this.state.message = null, 3000);
            },
            [ContextEvents.CONTEXT_STORED]
        );
    }

    public onDestroy(): void {
        super.onDestroy();
    }


    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
