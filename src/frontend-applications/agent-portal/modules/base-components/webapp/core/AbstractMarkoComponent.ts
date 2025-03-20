/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IMarkoComponent } from './IMarkoComponent';
import { AbstractComponentState } from './AbstractComponentState';

export abstract class AbstractMarkoComponent<CS = AbstractComponentState, I = any> implements IMarkoComponent<CS, I> {

    public state: CS;

    public onCreate(input: I): void {
        return;
    }

    public onInput(input: I): void {
        return;
    }

    public async onMount(): Promise<void> {
        return;
    }

    public onUpdate(): void {
        return;
    }

    public onDestroy(): void {
        return;
    }

}
