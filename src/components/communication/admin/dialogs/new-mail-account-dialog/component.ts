import { KIXObjectType, SystemAddressProperty, ContextMode, MailAccountProperty } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { AbstractNewDialog } from "../../../../../core/browser/components/dialog";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";
import { RoutingConfiguration } from "../../../../../core/browser/router";
import { SystemAddressDetailsContext } from "../../../../../core/browser/system-address";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Account',
            'Translatable#Account successfully created.',
            KIXObjectType.MAIL_ACCOUNT,
            null
            // new RoutingConfiguration(
            //     null, MailAccountDetailsContext.CONTEXT_ID, KIXObjectType.MAIL_ACCOUNT,
            //     ContextMode.DETAILS, MailAccountProperty.ID, true
            // )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);
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
