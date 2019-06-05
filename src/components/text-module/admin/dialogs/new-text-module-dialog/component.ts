import { KIXObjectType } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { AbstractNewDialog } from "../../../../../core/browser/components/dialog";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Text Module',
            'Translatable#Text Module successfully created.',
            KIXObjectType.TEXT_MODULE, null
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
