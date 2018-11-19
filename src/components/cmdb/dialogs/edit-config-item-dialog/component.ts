import { DialogService } from "@kix/core/dist/browser/dialog/DialogService";
import { FormService, ContextService } from "@kix/core/dist/browser";
import { ValidationSeverity, ContextType } from "@kix/core/dist/model";
import { ComponentState } from "./ComponentState";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");
        this.setFormId();
    }

    public async onDestroy(): Promise<void> {
        return;
    }

    public async setFormId(): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(true);
        let formId = null;
        const dialogContext = await ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        if (dialogContext) {
            const info = dialogContext.getAdditionalInformation();
            formId = info.length ? info[0] : null;
        }
        setTimeout(() => {
            this.state.formId = formId;
            DialogService.getInstance().setMainDialogLoading(false);
        }, 10);
    }

    public async cancel(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        setTimeout(async () => {
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            if (formInstance) {
                const result = await formInstance.validateForm();
                const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
            }
        }, 300);
    }

    // public showSuccessHint(): void {
    //     const content = new ComponentContent(
    //         'toast',
    //         new ToastContent('kix-icon-check', 'Ticketänderung gespeichert.')
    //     );
    //     OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
    // }

    // public showValidationError(result: ValidationResult[]): void {
    //     const errorMessages = result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message);
    //     const content = new ComponentContent('list-with-title',
    //         {
    //             title: 'Fehler beim Validieren des Formulars:',
    //             list: errorMessages
    //         }
    //     );

    //     OverlayService.getInstance().openOverlay(
    //         OverlayType.WARNING, null, content, 'Validierungsfehler', true
    //     );
    // }

    // public showError(error: any): void {
    //     OverlayService.getInstance().openOverlay(
    //         OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true
    //         );
    // }

}

module.exports = Component;
