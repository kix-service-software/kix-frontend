import { DialogService } from "../../../../core/browser/dialog/DialogService";
import {
    OverlayService, FormService, ContextService, ServiceRegistry
} from "../../../../core/browser";
import {
    ValidationSeverity, OverlayType, ComponentContent, StringContent, ValidationResult,
    KIXObjectType,
    ToastContent,
    CreateTicketArticleOptions,
    TicketProperty
} from "../../../../core/model";
import { ComponentState } from "./ComponentState";
import { TicketService, TicketDetailsContext } from "../../../../core/browser/ticket";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");
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
                DialogService.getInstance().setMainDialogLoading(true, "Artikel wird erstellt.");
                const service = ServiceRegistry.getInstance().getServiceInstance<TicketService>(KIXObjectType.ARTICLE);
                const ticketDetailsContext = await ContextService.getInstance().getContext(
                    TicketDetailsContext.CONTEXT_ID
                );
                const options = new CreateTicketArticleOptions(Number(ticketDetailsContext.getObjectId()));
                if (service && ticketDetailsContext) {
                    await service.createObjectByForm(KIXObjectType.ARTICLE, this.state.formId, options)
                        .then((articleId) => {
                            ticketDetailsContext.getObject(KIXObjectType.TICKET, true, [TicketProperty.ARTICLES]);
                            DialogService.getInstance().setMainDialogLoading(false);
                            this.showSuccessHint();
                            DialogService.getInstance().closeMainDialog();
                        }).catch((error) => {
                            DialogService.getInstance().setMainDialogLoading(false);
                            this.showError(error);
                        });
                }
            }
        }, 300);
    }

    public showSuccessHint(): void {
        const content = new ComponentContent(
            'toast',
            new ToastContent('kix-icon-check', 'Artikel erfolgreich angelegt.')
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
