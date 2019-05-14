import { ComponentState } from "./ComponentState";
import { FormService } from "../../../../core/browser";
import { DialogService } from "../../../../core/browser/components/dialog";
import { FormContext, KIXObjectType } from "../../../../core/model";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.formId = await FormService.getInstance().getFormIdByContext(
            FormContext.SEARCH, KIXObjectType.CONTACT
        );
    }

    public async cancel(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.reset();
        DialogService.getInstance().closeMainDialog();
    }

}

module.exports = Component;
