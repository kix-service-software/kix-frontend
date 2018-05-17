import { DialogService } from "@kix/core/dist/browser/dialog/DialogService";
import {
    FormValidationService, OverlayService, FormService, ContextService, ContextNotification
} from "@kix/core/dist/browser";
import {
    ValidationSeverity, OverlayType, ComponentContent, StringContent, ValidationResult
} from "@kix/core/dist/model";
import {
    TicketService, NewTicketDialogContext, NewTicketDialogContextConfiguration
} from "@kix/core/dist/browser/ticket";
import { NewTicketDialogComponentState } from "./NewTicketDialogComponentState";

class NewTicketDialogComponent {

    private state: NewTicketDialogComponentState;

    public onCreate(): void {
        this.state = new NewTicketDialogComponentState();
    }

    public onMount(): void {
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");

        ContextService.getInstance().addStateListener(this.contextChanged.bind(this));

        const context = new NewTicketDialogContext();
        ContextService.getInstance().provideContext(context, true);
    }

    private contextChanged(id: string, type: ContextNotification, ...args: any[]): void {
        if (type === ContextNotification.CONTEXT_CHANGED) {
            const context = ContextService.getInstance()
                .getContext<NewTicketDialogContextConfiguration, NewTicketDialogContext>();
            if (context) {
                this.state.configuration = context.contextConfiguration;
            }
        }
    }

    public onDestroy(): void {
        ContextService.getInstance().setPreviousContext();
    }

    private cancel(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.reset();
        DialogService.getInstance().closeMainDialog();
    }

    private async  submit(): Promise<void> {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        const result = formInstance.validateForm();
        const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            this.showValidationError(result);
        } else {
            DialogService.getInstance().setMainDialogLoading(true);
            await TicketService.getInstance().createTicketByForm(this.state.formId)
                .then((ticketId) => {
                    DialogService.getInstance().setMainDialogLoading(false);
                    this.showSuccessHint();
                    DialogService.getInstance().closeMainDialog();
                    TicketService.getInstance().openTicket(ticketId);
                }).catch((error) => {
                    DialogService.getInstance().setMainDialogLoading(false);
                    this.showError(error);
                });
        }
    }

    private showSuccessHint(): void {
        OverlayService.getInstance().openOverlay(
            OverlayType.TOAST, null,
            new StringContent('Ticket wurde erfolgreich angelegt.'), 'Ticket wurde erfolgreich angelegt'
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
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!');
    }

}

module.exports = NewTicketDialogComponent;
