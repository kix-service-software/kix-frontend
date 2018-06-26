import { NewCustomerDialogComponentState } from "./NewCustomerDialogComponentState";
import { DialogService, ContextService, FormService, OverlayService } from "@kix/core/dist/browser";
import {
    ContextType, OverlayType, StringContent, ComponentContent,
    ValidationSeverity, ValidationResult, KIXObjectType, ContextMode
} from "@kix/core/dist/model";
import { NewCustomerDialogContext, CustomerService } from "@kix/core/dist/browser/customer";

class NewCustomerDialogComponent {

    private state: NewCustomerDialogComponentState;

    public onCreate(): void {
        this.state = new NewCustomerDialogComponentState();
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");
    }

    private cancel(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.reset();
        }
        DialogService.getInstance().closeMainDialog();
    }

    private async submit(): Promise<void> {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        const result = formInstance.validateForm();
        const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            this.showValidationError(result);
        } else {
            DialogService.getInstance().setMainDialogLoading(true, "Kunde wird angelegt");
            await CustomerService.getInstance().createCustomerByForm(this.state.formId)
                .then((customerId) => {
                    DialogService.getInstance().setMainDialogLoading();
                    this.showSuccessHint();
                    DialogService.getInstance().closeMainDialog();
                    ContextService.getInstance().setContext(
                        null, KIXObjectType.CUSTOMER, ContextMode.DETAILS, customerId
                    );
                }).catch((error) => {
                    DialogService.getInstance().setMainDialogLoading();
                    this.showError(error);
                });
        }
    }

    private showSuccessHint(): void {
        const content = new ComponentContent('list-with-title', {
            title: 'Kunde wurde erfolgreich angelegt.',
            list: [],
            icon: 'kix-icon-check'
        });
        OverlayService.getInstance().openOverlay(OverlayType.TOAST, null, content, '');
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

module.exports = NewCustomerDialogComponent;
