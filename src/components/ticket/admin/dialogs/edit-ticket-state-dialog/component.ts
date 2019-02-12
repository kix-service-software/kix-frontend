import {
    OverlayService, FormService, AbstractMarkoComponent, KIXObjectService, ContextService, BrowserUtil, DialogService
} from "../../../../../core/browser";
import {
    ValidationSeverity, OverlayType, ComponentContent, ValidationResult, KIXObjectType, Error
} from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { TicketStateDetailsContext } from "../../../../../core/browser/ticket";

class Component extends AbstractMarkoComponent<ComponentState> {

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
                DialogService.getInstance().setMainDialogLoading(true, "Status wird aktualisiert");

                const context = await ContextService.getInstance().getContext<TicketStateDetailsContext>(
                    TicketStateDetailsContext.CONTEXT_ID
                );

                await KIXObjectService.updateObjectByForm(
                    KIXObjectType.TICKET_STATE, this.state.formId, context.getObjectId()
                ).then((typeId) => {
                    context.getObject(KIXObjectType.TICKET_STATE, true);
                    DialogService.getInstance().setMainDialogLoading(false);
                    BrowserUtil.openSuccessOverlay('Änderungen wurden gespeichert.');
                    DialogService.getInstance().submitMainDialog();
                }).catch((error: Error) => {
                    DialogService.getInstance().setMainDialogLoading(false);
                    BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                });
            }
        }, 300);
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

}

module.exports = Component;
