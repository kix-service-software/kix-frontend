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
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private closeCallback: () => void;
    private message: string;
    private title: string;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.closeCallback = input.closeCallback;
        this.message = input.message;
        this.title = input.title;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const object = await this.context?.getObject();
        this.state.message = await PlaceholderService.getInstance().replacePlaceholders(this.message, object);
        this.state.title = await PlaceholderService.getInstance().replacePlaceholders(this.title, object);
    }

    public closeTell(): void {
        if (this.closeCallback) {
            this.closeCallback();
        }
    }


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;