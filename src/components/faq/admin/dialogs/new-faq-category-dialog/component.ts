import { KIXObjectType, ContextMode } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { RoutingConfiguration } from "../../../../../core/browser/router";
import { AbstractNewDialog } from "../../../../../core/browser/components/dialog";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";
import { FAQCategoryDetailsContext } from "../../../../../core/browser/faq/admin";
import { FAQCategoryProperty } from "../../../../../core/model/kix/faq";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Category',
            'Translatable#Category successfully created.',
            KIXObjectType.FAQ_CATEGORY,
            new RoutingConfiguration(
                null, FAQCategoryDetailsContext.CONTEXT_ID, KIXObjectType.FAQ_CATEGORY,
                ContextMode.DETAILS, FAQCategoryProperty.ID, true
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
