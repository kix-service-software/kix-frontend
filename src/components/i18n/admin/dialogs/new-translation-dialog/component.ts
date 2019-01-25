import { AbstractNewDialog } from "../../../../../core/browser";
import { KIXObjectType } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Übersetzung wird angelegt',
            'Übersetzung wurde erfolgreich angelegt.',
            KIXObjectType.TRANSLATION,
            null
            // new RoutingConfiguration(
            //     null, TicketTypeDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_TYPE,
            //     ContextMode.DETAILS, TicketTypeProperty.ID, true
            // )
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
