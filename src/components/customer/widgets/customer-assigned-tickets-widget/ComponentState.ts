import { StandardTable } from "@kix/core/dist/browser";
import { Customer, WidgetComponentState, AbstractAction } from "@kix/core/dist/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public ticketCount: number = 0
    ) {
        super();
    }

}
