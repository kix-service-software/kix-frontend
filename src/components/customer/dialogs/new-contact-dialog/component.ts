import { ComponentState } from "./ComponentState";
import { DialogService, ContextService, FormService, OverlayService } from "@kix/core/dist/browser";
import {
    ContextType, OverlayType, StringContent, ComponentContent,
    ValidationSeverity, ValidationResult
} from "@kix/core/dist/model";
import { NewContactDialogContext, ContactService } from "@kix/core/dist/browser/contact";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");

        const context = new NewContactDialogContext();
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

    private async submit(): Promise<void> {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        const result = formInstance.validateForm();
        const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            this.showValidationError(result);
        } else {
            DialogService.getInstance().setMainDialogLoading(true, "Ansprechpartner wird angelegt");
            await ContactService.getInstance().createContactByForm(this.state.formId)
                .then((contactId) => {
                    DialogService.getInstance().setMainDialogLoading();
                    this.showSuccessHint();
                    DialogService.getInstance().closeMainDialog();
                }).catch((error) => {
                    DialogService.getInstance().setMainDialogLoading();
                    this.showError(error);
                });
        }
    }

    private showSuccessHint(): void {
        OverlayService.getInstance().openOverlay(
            OverlayType.TOAST,
            null,
            new StringContent('Ansprechpartner wurde erfolgreich angelegt.'),
            'Ansprechpartner wurde erfolgreich angelegt'
        );
    }

    private showValidationError(result: ValidationResult[]): void {
        const errorMessages = result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message);
        const content = new ComponentContent('list-with-title',
            {
                title: 'Fehler beim Validieren des Formulars:',
                list: errorMessages
            }
        );

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, 'Validierungsfehler', true
        );
    }

    private showError(error: any): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }
}

module.exports = Component;
