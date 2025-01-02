/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class AskOption {

    public Value: string;

    public Label: string;

    public constructor(option: AskOption) {
        if (option) {
            for (const key in option) {
                if (typeof option[key] !== 'undefined') {
                    this[key] = option[key];
                }
            }
        }
    }

}