import { WidgetComponentState } from '@kix/core/dist/browser/model';

export class TicketInfoComponentState extends WidgetComponentState {

    public ticketAttr: any[];

    public constructor() {
        super();
        this.ticketAttr = [];
    }

}
