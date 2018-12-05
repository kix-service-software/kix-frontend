import { DialogService } from "@kix/core/dist/browser/dialog/DialogService";
import {
    OverlayService, FormService, AbstractMarkoComponent, ServiceRegistry
} from "@kix/core/dist/browser";
import {
    ValidationSeverity, OverlayType, ComponentContent, StringContent, ValidationResult,
    ToastContent,
    KIXObjectType,
    ContextMode,
    TicketTypeProperty,
} from "@kix/core/dist/model";
import { ComponentState } from "./ComponentState";
import { TicketTypeService, TicketTypeDetailsContext } from "@kix/core/dist/browser/ticket";
import { RoutingConfiguration, RoutingService } from "@kix/core/dist/browser/router";

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.loading = true;
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");
        this.state.loading = false;
    }

    public async onDestroy(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
    }

    public async cancel(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        setTimeout(async () => {
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            const result = await formInstance.validateForm();
            const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
            if (validationError) {
                this.showValidationError(result);
            } else {
                DialogService.getInstance().setMainDialogLoading(true, "Typ wird angelegt");
                const service
                    = ServiceRegistry.getInstance().getServiceInstance<TicketTypeService>(KIXObjectType.TICKET_TYPE);
                await service.createObjectByForm(KIXObjectType.TICKET_TYPE, this.state.formId)
                    .then((typeId) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        this.showSuccessHint();
                        DialogService.getInstance().closeMainDialog();
                        const routingConfiguration = new RoutingConfiguration(
                            null, TicketTypeDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_TYPE,
                            ContextMode.DETAILS, TicketTypeProperty.ID, true
                        );
                        RoutingService.getInstance().routeToContext(routingConfiguration, typeId);
                    }).catch((error) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        this.showError(error);
                    });
            }

            if (formInstance) {
                formInstance.reset();
            }
        }, 300);
    }

    public showSuccessHint(): void {
        const content = new ComponentContent(
            'toast',
            new ToastContent('kix-icon-check', 'Typ wurde erfolgreich angelegt.')
        );
        OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
    }

    public showValidationError(result: ValidationResult[]): void {
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

    public showError(error: any): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }

}

module.exports = Component;
