/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { FormGroupConfiguration } from '../../../../../model/configuration/FormGroupConfiguration';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { FormPageConfiguration } from '../../../../../model/configuration/FormPageConfiguration';
import { ValidationSeverity } from '../../../../../modules/base-components/webapp/core/ValidationSeverity';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { ValidationResult } from '../../../../../modules/base-components/webapp/core/ValidationResult';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { PersonalSetting } from '../../../model/PersonalSetting';
import { Error } from '../../../../../../../server/model/Error';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { AgentService } from '../../core/AgentService';


class Component {

    private state: ComponentState;

    public async onCreate(input: any): Promise<void> {
        this.state = new ComponentState(input.instanceId);
    }

    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject(
            ['Translatable#Cancel', 'Translatable#Save']
        );

        await this.prepareForm();

        const context = ContextService.getInstance().getActiveContext();
        context.getFormManager().setFormId('personal-settings');

        this.state.loading = false;
    }

    private async prepareForm(): Promise<void> {
        const personalSettings: PersonalSetting[] = await AgentService.getInstance().getPersonalSettings();

        const formGroups: FormGroupConfiguration[] = [];
        personalSettings.forEach((ps) => {
            const group = formGroups.find((g) => g.name === ps.group);
            const formField = new FormFieldConfiguration(
                ps.property,
                ps.label, ps.property, ps.inputComponent, !!ps.required, ps.hint,
                ps.options, ps.defaultValue
            );
            if (group) {
                group.formFields.push(formField);
            } else {
                formGroups.push(new FormGroupConfiguration(ps.property, ps.group, [], null, [formField]));
            }
        });

        const formName = await TranslationService.translate('Translatable#Personal Settings');
        const form = new FormConfiguration(
            'personal-settings', formName,
            [], KIXObjectType.PERSONAL_SETTINGS, true, FormContext.EDIT, null,
            [
                new FormPageConfiguration(
                    'personal-settings-form-page', 'Translatable#Personal Settings',
                    [], null, true, formGroups
                )
            ]
        );

        await FormService.getInstance().addForm(form);
    }

    public cancel(): void {
        ContextService.getInstance().toggleActiveContext();
    }

    public async submit(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const result = await formInstance.validateForm();
        const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            this.showValidationError(result);
        } else {
            const loadingHint = await TranslationService.translate('Translatable#Save Settings');
            BrowserUtil.toggleLoadingShield('PERSONAL_SETTINGS_SHIELD', true, loadingHint);
            await AgentService.getInstance().setPreferencesByForm()
                .then(async () => {
                    TranslationService.getInstance().resetTranslations();
                    EventService.getInstance().publish('USER_LANGUAGE_CHANGED');
                    setTimeout(async () => {
                        BrowserUtil.toggleLoadingShield('PERSONAL_SETTINGS_SHIELD', false);
                        await ContextService.getInstance().toggleActiveContext(null, null, true);
                        EventService.getInstance().publish(ApplicationEvent.REFRESH);
                        const toast = await TranslationService.translate('Translatable#Changes saved.');
                        BrowserUtil.openSuccessOverlay(toast);
                    }, 100);
                }).catch((error: Error) => {
                    BrowserUtil.toggleLoadingShield('PERSONAL_SETTINGS_SHIELD', false);
                    BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                });
        }
    }

    public async showValidationError(result: ValidationResult[]): Promise<void> {
        const errorMessages = [];

        result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message).forEach((m) => {
            if (!errorMessages.some((em) => em === m)) {
                errorMessages.push(m);
            }
        });

        const title = await TranslationService.translate('Translatable#Error on form validation:');
        const content = new ComponentContent('list-with-title',
            {
                title,
                list: errorMessages
            }
        );

        const toastTitle = await TranslationService.translate('Translatable#Validation error');
        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, toastTitle, null, true
        );
    }
}

module.exports = Component;
