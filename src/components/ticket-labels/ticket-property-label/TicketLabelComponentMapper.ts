import { TicketProperty } from '@kix/core/dist/model';

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

            default:
                component = require('../ticket-string-label');
        }

        return component;
    }
}
