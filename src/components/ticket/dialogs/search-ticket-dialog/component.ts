import { ComponentState } from "./ComponentState";
import { FormService, DialogService } from "@kix/core/dist/browser";
import { FormContext, KIXObjectType } from "@kix/core/dist/model";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        this.state.formId = FormService.getInstance().getFormIdByContext(FormContext.SEARCH, KIXObjectType.TICKET);
    }

    public cancel(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.reset();
        DialogService.getInstance().closeMainDialog();
    }

}

module.exports = Component;
