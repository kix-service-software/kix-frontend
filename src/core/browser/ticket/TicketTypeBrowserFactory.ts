/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketType } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class TicketTypeBrowserFactory implements IKIXObjectFactory<TicketType> {

    private static INSTANCE: TicketTypeBrowserFactory;

    public static getInstance(): TicketTypeBrowserFactory {
        if (!TicketTypeBrowserFactory.INSTANCE) {
            TicketTypeBrowserFactory.INSTANCE = new TicketTypeBrowserFactory();
        }
        return TicketTypeBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(type: TicketType): Promise<TicketType> {
        return new TicketType(type);
    }

}
