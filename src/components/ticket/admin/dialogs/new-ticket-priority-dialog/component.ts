import { KIXObjectType, ContextMode, TicketPriorityProperty, } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { TicketPriorityDetailsContext } from "../../../../../core/browser/ticket";
import { RoutingConfiguration } from "../../../../../core/browser/router";
import { AbstractNewDialog } from "../../../../../core/browser/components/dialog";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Priorität wird angelegt',
            'Priorität wurde erfolgreich angelegt.',
            KIXObjectType.TICKET_PRIORITY,
            new RoutingConfiguration(
                null, TicketPriorityDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_PRIORITY,
                ContextMode.DETAILS, TicketPriorityProperty.ID, true
            )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit();
    }

}

module.exports = Component;
