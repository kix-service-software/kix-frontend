import { ComponentState } from './ComponentState';
import {
    FormService, DialogService, OverlayService, KIXObjectServiceRegistry, ContextService
} from '@kix/core/dist/browser';
import {
    ValidationSeverity, ComponentContent, OverlayType, ValidationResult, StringContent, KIXObjectType, ContextMode
} from '@kix/core/dist/model';
import { RoutingConfiguration, RoutingService } from '@kix/core/dist/browser/router';
import { FAQDetailsContext } from '@kix/core/dist/browser/faq';
import { FAQArticleProperty } from '@kix/core/dist/model/kix/faq';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.reset();
        }
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");
    }

    public cancel(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.reset();
        }
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        setTimeout(async () => {
            const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
            const result = formInstance.validateForm();
            const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
            if (validationError) {
                this.showValidationError(result);
            } else {
                DialogService.getInstance().setMainDialogLoading(true, "FAQ Artikel wird angelegt");
                const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(KIXObjectType.FAQ_ARTICLE);
                await service.createObjectByForm(KIXObjectType.FAQ_ARTICLE, this.state.formId)
                    .then((faqArticleId) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        this.showSuccessHint();
                        DialogService.getInstance().closeMainDialog();
                        ContextService.getInstance().setContext(
                            null, KIXObjectType.FAQ_ARTICLE, ContextMode.DETAILS, faqArticleId
                        );
                    }).catch((error) => {
                        DialogService.getInstance().setMainDialogLoading();
                        this.showError(error);
                    });
            }
        }, 300);
    }

    private showSuccessHint(): void {
        const content = new ComponentContent('list-with-title', {
            title: 'FAQ Artikel wurde erfolgreich angelegt.',
            list: [],
            icon: 'kix-icon-check'
        });
        OverlayService.getInstance().openOverlay(OverlayType.TOAST, null, content, '');
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
