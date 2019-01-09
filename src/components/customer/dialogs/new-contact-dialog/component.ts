import { ComponentState } from "./ComponentState";
import { AbstractNewDialog } from "../../../../core/browser";
import { ContextMode, KIXObjectType, ContactProperty } from "../../../../core/model";
import { ContactDetailsContext } from "../../../../core/browser/contact";
import { RoutingConfiguration } from "../../../../core/browser/router";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Ansprechpartner wird angelegt',
            'Ansprechpartner wurde erfolgreich angelegt.',
            KIXObjectType.CONTACT,
            new RoutingConfiguration(
                null, ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
                ContextMode.DETAILS, ContactProperty.ContactID, true
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
