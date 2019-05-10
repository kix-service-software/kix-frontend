import { KIXObjectType, ContextMode, QueueProperty } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { AbstractNewDialog } from "../../../../../core/browser/components/dialog";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";
import { RoutingConfiguration } from "../../../../../core/browser/router";
import { QueueDetailsContext } from "../../../../../core/browser/ticket";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Queue',
            'Translatable#Queue successfully created.',
            KIXObjectType.QUEUE,
            new RoutingConfiguration(
                null, QueueDetailsContext.CONTEXT_ID, KIXObjectType.QUEUE,
                ContextMode.DETAILS, QueueProperty.QUEUE_ID, true
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
