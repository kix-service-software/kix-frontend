/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { KIXModulesSocketClient } from '../../../../base-components/webapp/core/KIXModulesSocketClient';

class Component extends AbstractMarkoComponent<ComponentState> {

    private configKeys: string[] = [];
    private step: SetupStep;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.step = input.step;
        this.state.completed = this.step ? this.step.completed : false;
    }

    public async onMount(): Promise<void> {
        this.configKeys = [
            'FQDN'
        ];

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Save & Continue', 'Translatable#Skip & Continue', 'Translatable#Save'
        ]);

        await this.prepareForm();
        this.state.prepared = true;
    }

    private async prepareForm(): Promise<void> {
        const sysconfigDefinitions = await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, this.configKeys
        );

        const sysconfigOptions = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, this.configKeys
        );

        const fqdnHint = sysconfigDefinitions.find((o) => o.Name === 'FQDN').Description || '';
        const fqdnReadonly = sysconfigOptions.find((o) => o.Name === 'FQDN').ReadOnly;

        const fqdnFrontendField = new FormFieldConfiguration(
            'FQDN-frontend', 'Translatable#Frontend', 'Frontend', undefined, true, fqdnHint,
        );
        fqdnFrontendField.readonly = fqdnReadonly;
        const fqdnBackendField = new FormFieldConfiguration(
            'FQDN-backend', 'Translatable#Backend', 'Backend', undefined, true, fqdnHint,
        );
        fqdnBackendField.readonly = fqdnReadonly;
        const fqdnSSPField = new FormFieldConfiguration(
            'FQDN-ssp', 'Translatable#SSP', 'SSP', undefined, true, fqdnHint,
        );
        fqdnSSPField.readonly = fqdnReadonly;

        // show SSP option only if KIXPro plugin is available
        const releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
        fqdnSSPField.visible = releaseInfo?.plugins?.some((p) => p.product === 'KIXPro');

        const fqdnValue = sysconfigOptions.find((o) => o.Name === 'FQDN').Value ||
            sysconfigDefinitions.find((o) => o.Name === 'FQDN').Default;
        if (fqdnValue) {
            const objectValue = typeof fqdnValue === 'string' ? JSON.parse(fqdnValue) : fqdnValue;
            if (typeof objectValue === 'object') {
                fqdnFrontendField.defaultValue = new FormFieldValue(objectValue['Frontend']);
                fqdnBackendField.defaultValue = new FormFieldValue(objectValue['Backend']);
                fqdnSSPField.defaultValue = new FormFieldValue(objectValue['SSP']);
            }
        }

        const fqdnGroup = new FormGroupConfiguration(
            'setup-system-settings-fqdn-group', 'Translatable#FQDN', null, null,
            [
                fqdnFrontendField, fqdnBackendField, fqdnSSPField
            ]
        );

        const formGroups = [fqdnGroup];

        const form = new FormConfiguration(
            'setup-system-settings-form', 'System Settings', null, KIXObjectType.ANY,
            true, FormContext.EDIT, null,
            [
                new FormPageConfiguration(
                    'setup-system-settings-form-page', null, null, true, false, formGroups
                )
            ]
        );

        FormService.getInstance().addForm(form);
        this.state.formId = form.id;

        const activeContext = ContextService.getInstance().getActiveContext();
        await activeContext?.getFormManager()?.setFormId(this.state.formId);
    }

    public async submit(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();

        const result = await formInstance.validateForm();
        const validationError = result.some((r) => r && r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            BrowserUtil.showValidationError(result);
        } else {
            BrowserUtil.toggleLoadingShield('SETUP_SYSTEM_SETTINGS_SHIELD', true, 'Translatable#Save System Settings');

            await this.saveFQDNValue(formInstance).catch(() => null);

            await SetupService.getInstance().stepCompleted(this.step.id, null);

            BrowserUtil.toggleLoadingShield('SETUP_SYSTEM_SETTINGS_SHIELD', false);
        }
    }

    private async saveFQDNValue(formInstance: FormInstance): Promise<void> {
        const fqdnValue: any = {};

        const formFieldValues = formInstance.getAllFormFieldValues();
        formFieldValues.forEach((value: FormFieldValue, key: string) => {
            const field = formInstance.getFormField(key);
            if (field) {
                fqdnValue[field.property] = value.value;
            }
        });

        await KIXObjectService.updateObject(
            KIXObjectType.SYS_CONFIG_OPTION,
            [
                [SysConfigOptionProperty.VALUE, JSON.stringify(fqdnValue)],
                [KIXObjectProperty.VALID_ID, 1]
            ],
            'FQDN'
        );
    }

    public skip(): void {
        SetupService.getInstance().stepSkipped(this.step.id);
    }

}

module.exports = Component;
