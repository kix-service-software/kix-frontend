import { ComponentState } from './ComponentState';
import {
    FormService, DialogService, OverlayService, ContextService, KIXObjectService, BrowserUtil
} from '../../../../core/browser';
import {
    ValidationSeverity, ComponentContent, OverlayType, ValidationResult,
    StringContent, KIXObjectType, ToastContent, ContextType, Error
} from '../../../../core/model';

class Component {

    private state: ComponentState;

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
                DialogService.getInstance().setMainDialogLoading(true, "FAQ Artikel wird aktualisiert");
                const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
                if (context) {
                    await KIXObjectService.updateObjectByForm(
                        KIXObjectType.FAQ_ARTICLE, this.state.formId, context.getObjectId()
                    ).then((faqArticleId) => {
                        context.getObject(KIXObjectType.FAQ_ARTICLE, true);
                        DialogService.getInstance().setMainDialogLoading(false);
                        BrowserUtil.openSuccessOverlay('Änderungen wurden gespeichert.');
                        DialogService.getInstance().closeMainDialog();
                    }).catch((error: Error) => {
                        DialogService.getInstance().setMainDialogLoading();
                        BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                    });
                }
            }
        }, 300);
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

module.exports = Component;
