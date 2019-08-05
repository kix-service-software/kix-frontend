/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from '../kix';
import { ConsoleCommand } from '../../model/kix/console';

export class ConsoleCommandBrowserFactory implements IKIXObjectFactory<ConsoleCommand> {

    private static INSTANCE: ConsoleCommandBrowserFactory;

    public static getInstance(): ConsoleCommandBrowserFactory {
        if (!ConsoleCommandBrowserFactory.INSTANCE) {
            ConsoleCommandBrowserFactory.INSTANCE = new ConsoleCommandBrowserFactory();
        }
        return ConsoleCommandBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(command: ConsoleCommand): Promise<ConsoleCommand> {
        const newConsoleCommand = new ConsoleCommand(command);
        return newConsoleCommand;
    }

}
