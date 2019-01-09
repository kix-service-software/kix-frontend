import { ContextService, AbstractNewDialog, FormService } from "../../../../core/browser";
import { KIXObjectType, ContextMode, TicketProperty, FormInstance } from "../../../../core/model";
import { ComponentState } from "./ComponentState";
import { TicketDetailsContext, NewTicketDialogContext } from "../../../../core/browser/ticket";
import { RoutingConfiguration } from "../../../../core/browser/router";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Ticket wird angelegt',
            'Ticket wurde erfolgreich angelegt.',
            KIXObjectType.TICKET,
            new RoutingConfiguration(
                null, TicketDetailsContext.CONTEXT_ID, KIXObjectType.TICKET,
                ContextMode.DETAILS, TicketProperty.TICKET_ID, true
            )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const context = await ContextService.getInstance().getContext(NewTicketDialogContext.CONTEXT_ID);
        context.reset();
        await FormService.getInstance().getFormInstance<FormInstance>('new-ticket-form', false);
        this.state.loading = false;
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
    }

    public async cancel(): Promise<void> {
        super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit();
    }

}

module.exports = Component;
