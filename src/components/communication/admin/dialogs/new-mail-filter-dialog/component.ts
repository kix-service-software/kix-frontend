import { KIXObjectType, ContextMode, MailFilterProperty } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { AbstractNewDialog } from "../../../../../core/browser/components/dialog";
import { MailFilterDetailsContext } from "../../../../../core/browser/mail-filter";
import { RoutingConfiguration } from "../../../../../core/browser/router";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Filter',
            'Translatable#Filter successfully created.',
            KIXObjectType.MAIL_FILTER,
            new RoutingConfiguration(
                MailFilterDetailsContext.CONTEXT_ID, KIXObjectType.MAIL_FILTER,
                ContextMode.DETAILS, MailFilterProperty.ID, true
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
