/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { PlaceholderService } from '../../../../base-components/webapp/core/PlaceholderService';
import { AskOption } from '../../../model/interactions/AskOption';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private closeCallback: (answer: string) => void;
    private question: string;
    private title: string;
    private options: AskOption[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.closeCallback = input.closeCallback;
        this.question = input.question;
        this.title = input.title;
        this.options = JSON.parse(JSON.stringify(input.options));
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const object = await context.getObject();
        this.state.question = await PlaceholderService.getInstance().replacePlaceholders(this.question, object);
        this.state.title = await PlaceholderService.getInstance().replacePlaceholders(this.title, object);

        if (this.options?.length) {
            for (const o of this.options) {
                o.Label = await PlaceholderService.getInstance().replacePlaceholders(o.Label, object);
            }

            this.state.options = this.options;
        }
    }

    public closeAsk(answer: string): void {
        if (this.closeCallback) {
            this.closeCallback(answer);
        }
    }

}

module.exports = Component;