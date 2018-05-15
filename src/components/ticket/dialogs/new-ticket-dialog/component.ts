import { DialogService } from "@kix/core/dist/browser/DialogService";
import { FormValidationService, OverlayService, FormService } from "@kix/core/dist/browser";
import {
    ValidationSeverity, OverlayType, ComponentContent, StringContent, ValidationResult
} from "@kix/core/dist/model";

class NewTicketDialogComponent {

    private state: any;

    public onCreate(): void {
        this.state = {};
    }

    public onMount(): void {
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");
    }

    private submit(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance('new-ticket-form');
        const result = formInstance.validateForm();
        const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            this.showValidationError(result);
        } else {
            OverlayService.getInstance().openOverlay(
                OverlayType.TOAST, null, new StringContent('Ticket erfolgreich angelegt.'), 'Erfolg!'
            );
        }
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

}

module.exports = NewTicketDialogComponent;
