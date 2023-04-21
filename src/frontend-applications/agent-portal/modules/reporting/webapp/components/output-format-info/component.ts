/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ComponentState } from './ComponentState';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.data = input.data;
        this.state.completed = this.state.data.URL ? true : false;
    }

    public async onMount(): Promise<void> {
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

}

module.exports = Component;
