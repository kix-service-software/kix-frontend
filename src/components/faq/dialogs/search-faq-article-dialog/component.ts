import { ComponentState } from "./ComponentState";
import { FormService, DialogService } from "@kix/core/dist/browser";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public cancel(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.reset();
        DialogService.getInstance().closeMainDialog();
    }

}

module.exports = Component;
