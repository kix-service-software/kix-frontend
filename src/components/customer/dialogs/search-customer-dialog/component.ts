import { ComponentState } from "./ComponentState";
import { FormService } from "../../../../core/browser";
import { DialogService } from "../../../../core/browser/components/dialog";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async cancel(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.reset();
        DialogService.getInstance().closeMainDialog();
    }

}

module.exports = Component;
