import { KIXObjectType, UserProperty, ContextMode } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { AbstractNewDialog } from "../../../../../core/browser/components/dialog";
import { RoutingConfiguration } from "../../../../../core/browser/router";
import { UserDetailsContext } from "../../../../../core/browser/user";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Agent',
            'Translatable#Agent successfully created.',
            KIXObjectType.USER,
            new RoutingConfiguration(
                null, UserDetailsContext.CONTEXT_ID, KIXObjectType.USER,
                ContextMode.DETAILS, UserProperty.USER_ID, true
            )
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
