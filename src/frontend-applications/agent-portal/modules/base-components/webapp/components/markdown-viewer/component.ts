/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';

const marked = require('marked');

export class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        const lexed = marked.lexer(input.content);
        this.state.content = marked.parser(lexed);
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }
}

module.exports = Component;
