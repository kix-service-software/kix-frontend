/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AskOption } from './AskOption';
import { Interaction } from './Interaction';

export class Ask extends Interaction {

    public Question: string;

    public Identifier: string;

    public Options: AskOption[] = [];

    public constructor(ask: Ask) {
        super(ask);

        if (ask.Options?.length) {
            this.Options = ask.Options.map((o) => new AskOption(o));
        }
    }
}