import { ComponentState } from "./ComponentState";
import { FormService, AbstractMarkoComponent } from "../../../../core/browser";
import { DialogService } from "../../../../core/browser/components/dialog";
import { KIXObjectType, FormContext } from "../../../../core/model";

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.formId = await FormService.getInstance().getFormIdByContext(
            FormContext.SEARCH, KIXObjectType.CONFIG_ITEM
        );
        DialogService.getInstance().setMainDialogHint('Translatable#The search only includes current versions.');
    }

    public async cancel(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.reset();
        DialogService.getInstance().closeMainDialog();
    }

}

module.exports = Component;
