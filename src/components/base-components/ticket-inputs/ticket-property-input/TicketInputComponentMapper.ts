import { TicketProperty } from '@kix/core/dist/model';

export class TicketInputComponentMapper {

    private static INSTANCE: TicketInputComponentMapper;

    public static getInstance(): TicketInputComponentMapper {
        if (!TicketInputComponentMapper.INSTANCE) {
            TicketInputComponentMapper.INSTANCE = new TicketInputComponentMapper();
        }
        return TicketInputComponentMapper.INSTANCE;
    }

    public getInputComponent(property: string): any {
        let component = null;

        switch (property) {
            case TicketProperty.QUEUE_ID:
                component = require('../queue-input');
                break;

            case TicketProperty.PRIORITY_ID:
                component = require('../priority-input');
                break;

            case TicketProperty.TYPE_ID:
                component = require('../type-input');
                break;

            case TicketProperty.STATE_ID:
                component = require('../state-input');
                break;

            default:
                component = require('../text-input');
        }

        return component;
    }
}
