/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.data = input.data;
        this.state.completed = this.state.data.URL ? true : false;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Copy URL To Clipboard And Close'
        ]);

        this.state.prepared = true;
    }


    public async copyToClipboard(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        navigator.clipboard.writeText(this.state.data.URL);

        EventService.getInstance().publish(ApplicationEvent.CLOSE_OVERLAY);
    }


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
