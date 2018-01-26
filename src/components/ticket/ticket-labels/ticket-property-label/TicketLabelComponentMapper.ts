import { TicketProperty } from '@kix/core/dist/model';
import { TicketPriority } from '@kix/core/dist/model/ticket/TicketPriority';

export class TicketLabelComponentMapper {
    private static INSTANCE: TicketLabelComponentMapper;

    public static getInstance(): TicketLabelComponentMapper {
        if (!TicketLabelComponentMapper.INSTANCE) {
            TicketLabelComponentMapper.INSTANCE = new TicketLabelComponentMapper();
        }
        return TicketLabelComponentMapper.INSTANCE;
    }

    public getLabelComponent(property: string): any {
        let component = null;

        switch (property) {

            case TicketProperty.PRIORITY_ID:
                component = require('../ticket-priority-label');
                break;

            case TicketProperty.STATE_ID:
                component = require('../ticket-state-label');
                break;

            case TicketProperty.AGE:
                component = require('../ticket-age-label');
                break;

            case TicketProperty.CUSTOMER_ID:
                component = require('../ticket-customer-label');
                break;

            case TicketProperty.CUSTOMER_USER_ID:
                component = require('../ticket-contact-label');
                break;

            case TicketProperty.PENDING_TIME:
                component = require('../ticket-pending-time-label');
                break;

            default:
                component = require('../ticket-string-label');
        }

        return component;
    }
}
