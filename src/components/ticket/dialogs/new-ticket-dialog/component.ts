import { DialogService } from "@kix/core/dist/browser/dialog/DialogService";
import {
    OverlayService, FormService, ContextService, ServiceRegistry
} from "@kix/core/dist/browser";
import {
    ValidationSeverity, OverlayType, ComponentContent, StringContent, ValidationResult,
    KIXObjectType, ContextMode, ToastContent, TicketProperty
} from "@kix/core/dist/model";
import { ComponentState } from "./ComponentState";
import { TicketService, TicketDetailsContext } from "@kix/core/dist/browser/ticket";
import { RoutingService, RoutingConfiguration } from "@kix/core/dist/browser/router";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.loading = true;
        await this.reset();
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");
        this.state.loading = false;
    }

    public async cancel(): Promise<void> {
        await this.reset();
        DialogService.getInstance().closeMainDialog();
    }

    private async reset(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.reset();
        }
    }

    public async submit(): Promise<void> {
        setTimeout(async () => {
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            const result = await formInstance.validateForm();
            const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
            if (validationError) {
                this.showValidationError(result);
            } else {
                DialogService.getInstance().setMainDialogLoading(true, "Ticket wird angelegt");
                const service
                    = ServiceRegistry.getInstance().getServiceInstance<TicketService>(KIXObjectType.TICKET);
                await service.createObjectByForm(KIXObjectType.TICKET, this.state.formId)
                    .then((ticketId) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        this.showSuccessHint();
                        DialogService.getInstance().closeMainDialog();
                        const routingConfiguration = new RoutingConfiguration(
                            null, TicketDetailsContext.CONTEXT_ID, KIXObjectType.TICKET,
                            ContextMode.DETAILS, TicketProperty.TICKET_ID, true
                        );
                        RoutingService.getInstance().routeToContext(routingConfiguration, ticketId);
                    }).catch((error) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        this.showError(error);
                    });
            }
        }, 300);
    }

    private showSuccessHint(): void {
        const content = new ComponentContent(
            'toast',
            new ToastContent('kix-icon-check', 'Ticket wurde erfolgreich angelegt.')
        );
        OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
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
