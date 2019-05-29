import { KIXObjectType, ContextMode, MailAccountProperty } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { AbstractNewDialog } from "../../../../../core/browser/components/dialog";
import { RoutingConfiguration } from "../../../../../core/browser/router";
import { MailAccountDetailsContext } from "../../../../../core/browser/mail-account";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Account',
            'Translatable#Account successfully created.',
            KIXObjectType.MAIL_ACCOUNT,
            new RoutingConfiguration(
                MailAccountDetailsContext.CONTEXT_ID, KIXObjectType.MAIL_ACCOUNT,
                ContextMode.DETAILS, MailAccountProperty.ID, true
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
