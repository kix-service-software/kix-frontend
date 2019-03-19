import { ComponentState } from './ComponentState';
import {
    FormService, ServiceRegistry, ServiceType, OverlayService, BrowserUtil, ContextService
} from '../../../../core/browser';
import {
    KIXObjectType, FormField, FormFieldValue, PersonalSetting, Form, FormContext,
    ValidationSeverity, OverlayType, ComponentContent, ValidationResult, Error
} from '../../../../core/model';
import { FormGroup } from '../../../../core/model/components/form/FormGroup';
import { ApplicationEvent } from '../../../../core/browser/application';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { DialogService } from '../../../../core/browser/components/dialog';
import { EventService } from '../../../../core/browser/event';
import { AgentService } from '../../../../core/browser/application/AgentService';


class Component {

    private state: ComponentState;

    public async onCreate(input: any): Promise<void> {
        this.state = new ComponentState(input.instanceId);
    }

    public async onMount(): Promise<void> {
        const form = await this.prepareForm();
        FormService.getInstance().addform(form);
        this.state.formId = form.id;
        this.state.loading = false;
    }

    public async onDestroy(): Promise<void> {
        if (this.state.formId) {
            FormService.getInstance().deleteFormInstance(this.state.formId);
        }
    }

    private async prepareForm(): Promise<Form> {
        let personalSettings: PersonalSetting[] = [];

        const service = ServiceRegistry.getServiceInstance<AgentService>(
            KIXObjectType.PERSONAL_SETTINGS, ServiceType.OBJECT
        );
        if (service) {
            personalSettings = await service.getPersonalSettings();
        }

        const formGroups: FormGroup[] = [];
        personalSettings.forEach((ps) => {
            const group = formGroups.find((g) => g.name === ps.group);
            const formField = new FormField(
                ps.label, ps.property, ps.inputType, false, ps.hint, ps.options, new FormFieldValue(ps.defaultValue)
            );
            if (group) {
                group.formFields.push(formField);
            } else {
                formGroups.push(new FormGroup(ps.group, [formField]));
            }
        });

        const formName = await TranslationService.translate('Translatable#Personal Settings');
        return new Form(
            'personal-settings', formName,
            formGroups, KIXObjectType.PERSONAL_SETTINGS, true, FormContext.EDIT,
            null, null, true
        );
    }

    public async cancel(): Promise<void> {
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        if (this.state.formId) {

            const loadingHint = await TranslationService.translate('Translatable#Save Settings.');
            DialogService.getInstance().setMainDialogLoading(false, loadingHint);
            setTimeout(async () => {
                const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
                const result = await formInstance.validateForm();
                const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
                if (validationError) {
                    this.showValidationError(result);
                } else {
                    const service = ServiceRegistry.getServiceInstance<AgentService>(
                        KIXObjectType.PERSONAL_SETTINGS, ServiceType.OBJECT
                    );
                    if (service) {
                        await service.setPreferencesByForm(this.state.formId)
                            .then(async () => {
                                DialogService.getInstance().setMainDialogLoading(false);

                                const toast = await TranslationService.translate('Translatable#Changes saved.');
                                BrowserUtil.openSuccessOverlay(toast);
                                DialogService.getInstance().submitMainDialog();
                                EventService.getInstance().publish(ApplicationEvent.REFRESH);
                            }).catch((error: Error) => {
                                DialogService.getInstance().setMainDialogLoading(false);
                                BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                            });
                    }
                }
            });
        }
    }

    public async showValidationError(result: ValidationResult[]): Promise<void> {
        const errorMessages = result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message);

        const title = await TranslationService.translate('Translatable#Error on form validation:');

        const content = new ComponentContent('list-with-title',
            {
                title,
                list: errorMessages
            }
        );

        const toastTitle = await TranslationService.translate('Translatable#Validation Error');

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, toastTitle, true
        );
    }
}

module.exports = Component;
