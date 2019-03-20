import { ComponentState } from './ComponentState';
import {
    FormService, OverlayService, KIXObjectService, ContextService, BrowserUtil
} from '../../../../core/browser';
import {
    OverlayType, ComponentContent,
    ValidationSeverity, ValidationResult, KIXObjectType, ContextType, Error
} from '../../../../core/model';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { DialogService } from '../../../../core/browser/components/dialog';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.loading = true;
        DialogService.getInstance().setMainDialogHint('Translatable#All form fields marked by * are required fields.');
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
            DialogService.getInstance().setMainDialogLoading(true, 'Translatable#Update Contact');
            const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
            if (context) {
                await KIXObjectService.updateObjectByForm(
                    KIXObjectType.CONTACT, this.state.formId, context.getObjectId()
                ).then(async (contactId) => {
                    context.getObject(KIXObjectType.CONTACT, true);
                    DialogService.getInstance().setMainDialogLoading(false);

                    const toast = await TranslationService.translate('Translatable#Changes saved.');
                    BrowserUtil.openSuccessOverlay(toast);
                    DialogService.getInstance().submitMainDialog();
                }).catch((error: Error) => {
                    DialogService.getInstance().setMainDialogLoading();
                    BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                });
            }
        }
    }

    private showValidationError(result: ValidationResult[]): void {
        const errorMessages = result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message);
        const content = new ComponentContent('list-with-title',
            {
                title: 'Translatable#Fehler beim Validieren des Formulars:',
                list: errorMessages
            }
        );

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, 'Translatable#Validation error', true
        );
    }

}

module.exports = Component;
