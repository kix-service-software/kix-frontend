import { DialogService } from "@kix/core/dist/browser/DialogService";
import { FormValidationService, OverlayService, FormService } from "@kix/core/dist/browser";
import { ValidationSeverity, OverlayType, ComponentContent, StringContent } from "@kix/core/dist/model";

class NewTicketDialogComponent {

    private state: any;

    public onCreate(): void {
        this.state = {};
    }

    public onMount(): void {
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");
    }

    private submit(): void {
        const result = FormValidationService.getInstance().validateForm('new-ticket-form');
        const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
        if (validationError) {
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
        } else {
            OverlayService.getInstance().openOverlay(
                OverlayType.TOAST, null, new StringContent('Ticket erfolgreich angelegt.'), 'Erfolg!'
            );
        }
    }

}

module.exports = NewTicketDialogComponent;
