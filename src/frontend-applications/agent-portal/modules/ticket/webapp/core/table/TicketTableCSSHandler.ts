/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Ticket } from '../../../model/Ticket';
import { TicketProperty } from '../../../model/TicketProperty';
import { SysConfigService } from '../../../../sysconfig/webapp/core';
import { TableValue } from '../../../../table/model/TableValue';
import { ITableCSSHandler } from '../../../../table/webapp/core/css-handler/ITableCSSHandler';

export class TicketTableCSSHandler implements ITableCSSHandler<Ticket> {

    public async getRowCSSClasses(ticket: Ticket): Promise<string[]> {
        const classes = [];

        if (ticket) {
            if (ticket.Unseen) {
                classes.push('article-unread');
            }

            const stateTypes = await SysConfigService.getInstance().getTicketViewableStateTypes();
            if (ticket.StateType && !stateTypes?.some((t) => t === ticket.StateType)) {
                classes.push('invalid-object');
            }
        }

        return classes;
    }

    public async getValueCSSClasses(ticket: Ticket, value: TableValue): Promise<string[]> {
        const classes = [];
        switch (value.property) {
            case TicketProperty.UNSEEN:
                classes.push('unseen');
                break;
            default:
        }
        return classes;
    }

}
