import { DialogService } from "../../../../../core/browser/dialog/DialogService";
import { AbstractNewDialog } from "../../../../../core/browser";
import { KIXObjectType, ContextMode, TicketStateProperty } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { TicketStateDetailsContext } from "../../../../../core/browser/ticket";
import { RoutingConfiguration } from "../../../../../core/browser/router";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Status wird angelegt',
            'Status wurde erfolgreich angelegt.',
            KIXObjectType.TICKET_STATE,
            new RoutingConfiguration(
                null, TicketStateDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_STATE,
                ContextMode.DETAILS, TicketStateProperty.ID, true
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
