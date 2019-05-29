import { ComponentState } from "./ComponentState";
import { FormService } from "../../../../core/browser";
import { DialogService } from "../../../../core/browser/components/dialog";
import { KIXObjectType, FormContext } from "../../../../core/model";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.formId = await FormService.getInstance().getFormIdByContext(
            FormContext.SEARCH, KIXObjectType.TICKET
        );
    }

    public async cancel(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.reset();
        DialogService.getInstance().closeMainDialog();
    }

}

module.exports = Component;
