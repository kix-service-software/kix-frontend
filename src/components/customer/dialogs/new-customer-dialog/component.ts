import { NewCustomerDialogComponentState } from "./NewCustomerDialogComponentState";
import {
    DialogService, ContextService, FormService, OverlayService, ServiceRegistry
} from "../../../../core/browser";
import {
    OverlayType, StringContent, ComponentContent,
    ValidationSeverity, ValidationResult, KIXObjectType, ContextMode, ToastContent, CustomerProperty
} from "../../../../core/model";
import { CustomerService, CustomerDetailsContext } from "../../../../core/browser/customer";
import { RoutingService, RoutingConfiguration } from "../../../../core/browser/router";

class NewCustomerDialogComponent {

    private state: NewCustomerDialogComponentState;

    public onCreate(): void {
        this.state = new NewCustomerDialogComponentState();
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
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const result = await formInstance.validateForm();
        const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            this.showValidationError(result);
        } else {
            DialogService.getInstance().setMainDialogLoading(true, "Kunde wird angelegt");
            const service
                = ServiceRegistry.getInstance().getServiceInstance<CustomerService>(KIXObjectType.CUSTOMER);
            await service.createObjectByForm(KIXObjectType.CUSTOMER, this.state.formId)
                .then((customerId) => {
                    DialogService.getInstance().setMainDialogLoading();
                    this.showSuccessHint();
                    DialogService.getInstance().closeMainDialog();
                    const routingConfiguration = new RoutingConfiguration(
                        null, CustomerDetailsContext.CONTEXT_ID, KIXObjectType.CUSTOMER,
                        ContextMode.DETAILS, CustomerProperty.CUSTOMER_ID, true
                    );
                    RoutingService.getInstance().routeToContext(routingConfiguration, customerId);
                }).catch((error) => {
                    DialogService.getInstance().setMainDialogLoading();
                    this.showError(error);
                });
        }
    }

    private showSuccessHint(): void {
        const content = new ComponentContent(
            'toast',
            new ToastContent('kix-icon-check', 'Kunde wurde erfolgreich angelegt.')
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

module.exports = NewCustomerDialogComponent;
