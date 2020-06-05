/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFactory } from '../../../../modules/base-components/webapp/core/KIXObjectFactory';
import { TicketHistory } from '../../model/TicketHistory';

export class TicketHistoryBrowserFactory extends KIXObjectFactory<TicketHistory> {

    private static INSTANCE: TicketHistoryBrowserFactory;

    public static getInstance(): TicketHistoryBrowserFactory {
        if (!TicketHistoryBrowserFactory.INSTANCE) {
            TicketHistoryBrowserFactory.INSTANCE = new TicketHistoryBrowserFactory();
        }
        return TicketHistoryBrowserFactory.INSTANCE;
    }

    protected constructor() {
        super();
    }

    public async create(history: TicketHistory): Promise<TicketHistory> {
        return new TicketHistory(history);
    }

}
