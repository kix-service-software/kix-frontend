/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { ConsoleParameter } from './ConsoleParameter';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { ConsoleArgument } from './ConsoleArgument';

export class ConsoleCommand extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CONSOLE_COMMAND;

    public AdditionalHelp: string;

    public Arguments: ConsoleArgument[];

    public Command: string;

    public Description: string;

    public Parameters: ConsoleParameter[];

    public constructor(command?: ConsoleCommand) {
        super(command);
        if (command) {
            this.AdditionalHelp = command.AdditionalHelp;
            this.Arguments = command.Arguments;
            this.Command = command.Command;
            this.Description = command.Description;
            this.Parameters = command.Parameters;
        }
    }
}
