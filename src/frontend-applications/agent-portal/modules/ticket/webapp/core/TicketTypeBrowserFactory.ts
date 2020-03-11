/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from "../../../../modules/base-components/webapp/core/IKIXObjectFactory";
import { TicketType } from "../../model/TicketType";


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
