import { DialogService } from "@kix/core/dist/browser/dialog/DialogService";
import {
    FormValidationService, OverlayService, FormService, ContextService
} from "@kix/core/dist/browser";
import {
    ValidationSeverity, OverlayType, ComponentContent, StringContent, ValidationResult,
    ContextType, FormFieldValue, FormField, TicketProperty, Customer, Contact, KIXObjectType
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

    public async onMount(): Promise<void> {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.reset();
            formInstance.registerListener({
                formValueChanged: (formField: FormField, value: FormFieldValue<any>, oldValue: any) => {
                    const dialogContext = ContextService.getInstance().getContext(
                        null, NewTicketDialogContext.CONTEXT_ID
                    );
                    if (dialogContext) {
                        if (formField.property === TicketProperty.CUSTOMER_ID) {
                            if ((value.value === null || value.value === undefined)) {
                                const customer: Customer = oldValue;
                                if (customer) {
                                    dialogContext.provideObject(customer.CustomerID, null, KIXObjectType.CUSTOMER);
                                }
                            } else {
                                const customer: Customer = value.value;
                                dialogContext.provideObject(customer.CustomerID, customer, KIXObjectType.CUSTOMER);
                            }
                        } else if (formField.property === TicketProperty.CUSTOMER_USER_ID) {
                            if ((value.value === null || value.value === undefined)) {
                                const contact: Contact = oldValue;
                                if (contact) {
                                    dialogContext.provideObject(contact.ContactID, null, KIXObjectType.CONTACT);
                                }
                            } else {
                                const contact: Contact = value.value;
                                dialogContext.provideObject(contact.ContactID, contact, KIXObjectType.CONTACT);
                            }
                        }
                    }
                },
                updateForm: () => { return; }
            });
        }

        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");

        const context = new NewTicketDialogContext();
        this.state.loading = true;
        await ContextService.getInstance().provideContext(context, true, ContextType.DIALOG);
        this.state.loading = false;
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
            DialogService.getInstance().setMainDialogLoading(true, "Ticket wird angelegt");
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
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }

}

module.exports = NewTicketDialogComponent;
