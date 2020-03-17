/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from "../../../../modules/base-components/webapp/core/IKIXObjectFactory";
import { TicketState } from "../../model/TicketState";

export class TicketStateBrowserFactory implements IKIXObjectFactory<TicketState> {

    private static INSTANCE: TicketStateBrowserFactory;

    public static getInstance(): TicketStateBrowserFactory {
        if (!TicketStateBrowserFactory.INSTANCE) {
            TicketStateBrowserFactory.INSTANCE = new TicketStateBrowserFactory();
        }
        return TicketStateBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(state: TicketState): Promise<TicketState> {
        return new TicketState(state);
    }

}
