/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { ConsoleParameter } from "./ConsoleParameter";

export class ConsoleCommand extends KIXObject<ConsoleCommand> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CONSOLE_COMMAND;

    public AdditionalHelp: string;

    public Arguments: string[];

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
