/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export interface IMarkoComponent<CS extends any, I extends any> {

    state: CS;

    onCreate(input: I): void;

    onInput(input: I): void;

    onMount(): Promise<void>;

    onUpdate(): void;

    onDestroy(): void;

}
