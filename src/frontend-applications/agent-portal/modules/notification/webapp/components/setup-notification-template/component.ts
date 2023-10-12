/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { SysConfigOption } from '../../../../sysconfig/model/SysConfigOption';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { FormPageConfiguration } from '../../../../../model/configuration/FormPageConfiguration';
import { FormGroupConfiguration } from '../../../../../model/configuration/FormGroupConfiguration';
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { SysConfigOptionDefinition } from '../../../../sysconfig/model/SysConfigOptionDefinition';
import { ValidationSeverity } from '../../../../base-components/webapp/core/ValidationSeverity';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { SysConfigOptionProperty } from '../../../../sysconfig/model/SysConfigOptionProperty';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { SetupStep } from '../../../../setup-assistant/webapp/core/SetupStep';
import { SetupService } from '../../../../setup-assistant/webapp/core/SetupService';
import { FormFieldOption } from '../../../../../model/configuration/FormFieldOption';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private configKeys: string[] = [];
    private step: SetupStep;
    private previewWindow: any;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.state.isSetup = typeof input.setup === 'undefined' ? false : input.setup;
    }

    public async onMount(): Promise<void> {
        this.configKeys = [
            'Notification::Template'
        ];

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Preview', 'Translatable#Save & Continue', 'Translatable#Skip & Continue', 'Translatable#Save'
        ]);

        await this.prepareForm();
        this.state.prepared = true;
    }

    public onInput(input: any): void {
        this.step = input.step;
        this.state.completed = this.step ? this.step.completed : false;
    }

    private async prepareForm(): Promise<void> {
        const sysconfigDefinitions = await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, this.configKeys
        );
        const templateDef = sysconfigDefinitions ?
            sysconfigDefinitions.find((o) => o.Name === 'Notification::Template') : null;

        const sysconfigOptions = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, this.configKeys
        );
        const templateOption = sysconfigOptions ?
            sysconfigOptions.find((o) => o.Name === 'Notification::Template') : null;

        const hint = templateDef ? templateDef.Description : '';
        const readonly = templateOption ? templateOption.ReadOnly : false;
        const group = new FormGroupConfiguration(
            'setup-notification-template-form-group', 'Translatable#Template', null, null,
            [
                new FormFieldConfiguration(
                    'Notification::Template', 'Translatable#Template', 'Notification::Template', 'text-area-input',
                    true, hint,
                    [
                        new FormFieldOption('ROWS', 50)
                    ],
                    null, null, null, null, null, null, null, null, null, null, null, null,
                    readonly
                )
            ]
        );

        const form = new FormConfiguration(
            'setup-notification-template-form', 'Notification Template', null, KIXObjectType.SYS_CONFIG_OPTION,
            true, FormContext.EDIT, null,
            [
                new FormPageConfiguration(
                    'setup-notification-template-form-page', null, null, true, false, [group]
                )
            ]
        );

        FormService.getInstance().addForm(form);
        this.state.formId = form.id;

        const context = ContextService.getInstance().getActiveContext();
        context?.getFormManager()?.setFormId(this.state.formId);

        setTimeout(() => this.initFormValues(form.id), 100);
    }

    private async initFormValues(formId: string, configKeys: string[] = this.configKeys): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();

        if (formInstance) {
            const sysconfigOptions = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, configKeys
            );

            if (sysconfigOptions) {
                const values: Array<[string, any]> = configKeys.map(
                    (k) => [k, sysconfigOptions.find((o) => o.Name === k).Value]
                );

                formInstance.provideFormFieldValuesForProperties(values, null);
            }
        }
    }

    public async submit(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();

        if (formInstance) {
            const result = await formInstance.validateForm();
            const validationError = result.some((r) => r && r.severity === ValidationSeverity.ERROR);
            if (validationError) {
                BrowserUtil.showValidationError(result);
            } else {
                BrowserUtil.toggleLoadingShield('SETUP_NOTIFICATION_SHIELD', true, 'Translatable#Save notification template');

                await this.saveSysconfigValues(formInstance).catch(() => null);
                if (this.state.isSetup) {
                    await SetupService.getInstance().stepCompleted(this.step.id, null);
                }
                BrowserUtil.toggleLoadingShield('SETUP_NOTIFICATION_SHIELD', false);
            }
        }
    }

    private async saveSysconfigValues(formInstance: FormInstance): Promise<void> {
        const values: Array<[string, any]> = [];

        const formFieldValues = formInstance.getAllFormFieldValues();
        formFieldValues.forEach((value: FormFieldValue, key: string) => {
            const field = formInstance.getFormField(key);
            const v = Array.isArray(value.value) ? value.value[0] : value.value;
            values.push([field.property, v]);
        });

        for (const value of values) {
            await KIXObjectService.updateObject(
                KIXObjectType.SYS_CONFIG_OPTION,
                [[SysConfigOptionProperty.VALUE, value[1]], [KIXObjectProperty.VALID_ID, 1]],
                value[0]
            );
        }
    }

    public skip(): void {
        SetupService.getInstance().stepSkipped(this.step.id);
    }

    public async preview(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        if (formInstance) {
            const htmlStringValue = await formInstance.getFormFieldValueByProperty<string>('Notification::Template');
            if (htmlStringValue && htmlStringValue.value) {
                if (this.previewWindow && !this.previewWindow.closed) {
                    this.previewWindow.close();
                }
                this.previewWindow = window.open('', '_blank', 'menubar=no,toolbar=no,location=no,status=no,scrollbars=yes');
                const previewValue = htmlStringValue.value.replace(/<script.*?>.*?<\/script>/gs, '')
                    .replace(/\[%\s+Data\.Subject.+?%\]/gs, 'Lorem ipsum dolor sit amet')
                    .replace(
                        /\[%\s+Data\.Body.+?%\]/gs,
                        '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,<br> sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,<br> no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,<br> sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p><br><p>Lorem ipsum dolor sit amet,<br>consetetur sadipscing elitr,<br>sed diam nonumy eirmod tempor invidunt<br>ut labore et dolore magna aliquyam</p>'
                    );
                this.previewWindow.document.write(previewValue);
            }
        }
    }

}

module.exports = Component;
