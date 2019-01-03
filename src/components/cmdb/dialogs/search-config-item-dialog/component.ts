import { ComponentState } from "./ComponentState";
import { FormService, DialogService, AbstractMarkoComponent } from "../../../../core/browser";

class Component extends AbstractMarkoComponent {

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogHint('Es werden nur aktuelle Versionen durchsucht.');
    }

    public async cancel(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.reset();
        DialogService.getInstance().closeMainDialog();
    }

}

module.exports = Component;
