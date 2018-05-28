import { NewCustomerDialogComponentState } from "./NewCustomerDialogComponentState";
import { DialogService, ContextService, FormService } from "@kix/core/dist/browser";
import { ContextType } from "@kix/core/dist/model";
import { NewCustomerDialogContext } from "@kix/core/dist/browser/customer";

class NewCustomerDialogComponent {

    private state: NewCustomerDialogComponentState;

    public onCreate(): void {
        this.state = new NewCustomerDialogComponentState();
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");

        const context = new NewCustomerDialogContext();
        this.state.loading = true;
        await ContextService.getInstance().provideContext(context, true, ContextType.DIALOG);
        this.state.loading = false;
    }

    private cancel(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.reset();
        }
        DialogService.getInstance().closeMainDialog();
    }
}

module.exports = NewCustomerDialogComponent;
