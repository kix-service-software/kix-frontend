/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { SysConfigOptionDefinition } from '../../model/SysConfigOptionDefinition';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { SysConfigOptionDefinitionProperty } from '../../model/SysConfigOptionDefinitionProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { FormPageConfiguration } from '../../../../model/configuration/FormPageConfiguration';
import { FormGroupConfiguration } from '../../../../model/configuration/FormGroupConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { ObjectReferenceOptions } from '../../../base-components/webapp/core/ObjectReferenceOptions';
import { SysConfigOption } from '../../model/SysConfigOption';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { FormContext } from '../../../../model/configuration/FormContext';

export class SysConfigFormService extends KIXObjectFormService {

    private static INSTANCE: SysConfigFormService = null;

    public static getInstance(): SysConfigFormService {
        if (!SysConfigFormService.INSTANCE) {
            SysConfigFormService.INSTANCE = new SysConfigFormService();
        }

        return SysConfigFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION
            || kixObjectType === KIXObjectType.SYS_CONFIG_OPTION;
    }

    protected async prePrepareForm(form: FormConfiguration, kixObject?: KIXObject): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            const sysconfigKeys = await context.getObjectList(
                KIXObjectType.SYS_CONFIG_OPTION_DEFINITION
            );

            if (sysconfigKeys && sysconfigKeys.length) {
                form.pages = await this.createPages(sysconfigKeys as SysConfigOptionDefinition[]);
            }
        }
    }

    private async createPages(sysconfigKeys: SysConfigOptionDefinition[]): Promise<FormPageConfiguration[]> {
        const pages: FormPageConfiguration[] = [];
        for (const key of sysconfigKeys) {
            const page = new FormPageConfiguration(key.Name, key.Name, [], true, false, [
                new FormGroupConfiguration(key.Name, key.Name, [], null, [
                    new FormFieldConfiguration(
                        'sysconfig-edit-form-field-name',
                        'Translatable#Name', SysConfigOptionDefinitionProperty.NAME, null, true,
                        'Translatable#Helptext_Admin_SysConfigEdit_Name',
                        [
                            new FormFieldOption('SYSCONFIG_NAME', key.Name)
                        ],
                        null, null, null, null,
                        null, null, null, null, null, null, false, false, true
                    ),
                    new FormFieldConfiguration(
                        'sysconfig-edit-form-field-description',
                        'Translatable#Description', SysConfigOptionDefinitionProperty.DESCRIPTION, 'text-area-input',
                        false, 'Translatable#Helptext_Admin_SysConfigEdit_Description',
                        [
                            new FormFieldOption('SYSCONFIG_NAME', key.Name)
                        ],
                        null, null, null, null,
                        null, null, null, null, null, null, false, false, true
                    ),
                    new FormFieldConfiguration(
                        'sysconfig-edit-form-field-value',
                        'Translatable#Value', SysConfigOptionDefinitionProperty.VALUE, 'text-area-input', false,
                        'Translatable#Helptext_Admin_SysConfigEdit_Value',
                        [
                            new FormFieldOption(FormFieldOptions.IS_JSON, true),
                            new FormFieldOption('SYSCONFIG_NAME', key.Name)
                        ]
                    ),
                    new FormFieldConfiguration(
                        'sysconfig-edit-form-field-default-value',
                        'Translatable#Default Value', SysConfigOptionDefinitionProperty.DEFAULT,
                        'text-area-input', false, 'Translatable#Helptext_Admin_SysConfigEdit_Default_Value',
                        [
                            new FormFieldOption('SYSCONFIG_NAME', key.Name)
                        ],
                        null, null, null, null, null, null, null, null, null, null, false, false, true
                    ),
                    new FormFieldConfiguration(
                        'sysconfig-edit-form-field-valid',
                        'Translatable#Validity', KIXObjectProperty.VALID_ID,
                        'object-reference-input', true, 'Translatable#Helptext_Admin_SysConfigEdit_Validity',
                        [
                            new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT),
                            new FormFieldOption('SYSCONFIG_NAME', key.Name)
                        ]
                    )
                ])
            ]);

            pages.push(page);
        }

        return pages;
    }

    public async initValues(form: FormConfiguration, formInstance: FormInstance): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        const sysconfigKeys = await context.getObjectList(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION
        );

        if (sysconfigKeys && sysconfigKeys.length) {
            await super.initValues(form, formInstance, null);
        } else {
            const sysConfigId = context ? context.getObjectId() : null;
            const sysConfigValues = sysConfigId
                ? await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
                    KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, [sysConfigId]) : null;
            await super.initValues(form, formInstance, sysConfigValues ? sysConfigValues[0] : null);
        }
    }

    protected async getValue(
        property: string, value: any, sysConfig: SysConfigOptionDefinition, formField: FormFieldConfiguration
    ): Promise<any> {
        if (sysConfig) {
            value = await this.handleSingleSysconfigKey(property, value, sysConfig, formField);
        } else {
            value = await this.handleSysconfigListValue(property, value, formField);
        }
        return value;
    }

    private async handleSingleSysconfigKey(
        property: string, value: any, sysConfig: SysConfigOptionDefinition, formField: FormFieldConfiguration
    ): Promise<any> {
        switch (property) {
            case SysConfigOptionDefinitionProperty.SETTING:
                if (value && Array.isArray(value)) {
                    value = value.join(',');
                }
                break;
            case SysConfigOptionDefinitionProperty.DEFAULT:
                if (typeof value !== 'string' && typeof value !== 'number') {
                    value = JSON.stringify(value);
                }
                break;
            case SysConfigOptionDefinitionProperty.VALUE:

                const options = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [sysConfig.Name]
                );

                // if no option or value is null and option is invalid, uses values from definition
                // (check if null-value and invalid comes first, because value could be from config-file)
                value = !options || !options.length || (options[0].Value === null && sysConfig.ValidID !== 1)
                    ? !sysConfig.IsModified || sysConfig.Value === null || sysConfig.Value === '' // 0 is valid
                        ? sysConfig.Default : sysConfig.Value
                    : options[0].Value;
                formField.readonly = options[0].ReadOnly;

                if (typeof value !== 'string' && typeof value !== 'number') {
                    value = JSON.stringify(value);
                }

                if (value === null) {
                    value = '';
                }
                break;
            case SysConfigOptionDefinitionProperty.DEFAULT_VALID_ID:
            case KIXObjectProperty.VALID_ID:
                if (sysConfig.IsRequired) {
                    formField.readonly = true;
                }
                break;
            default:
        }

        return value;
    }

    private async handleSysconfigListValue(
        property: string, value: any, formField: FormFieldConfiguration
    ): Promise<any> {
        const option = formField.options ? formField.options.find((o) => o.option === 'SYSCONFIG_NAME') : null;

        if (option) {
            const context = ContextService.getInstance().getActiveContext();

            const sysconfigKeys = await context.getObjectList(
                KIXObjectType.SYS_CONFIG_OPTION_DEFINITION
            );

            const sysConfig = sysconfigKeys.find((sk: SysConfigOptionDefinition) => sk.Name === option.value);
            value = await this.handleSingleSysconfigKey(
                property, sysConfig[property], sysConfig as SysConfigOptionDefinition, formField
            );
        }

        return value;
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        formContext?: FormContext, formInstance?: FormInstance
    ): Promise<Array<[string, any]>> {

        const defaultParameter = parameter.find((p) => p[0] === SysConfigOptionDefinitionProperty.DEFAULT);
        const value = parameter.find((p) => p[0] === SysConfigOptionDefinitionProperty.VALUE);
        if (value && defaultParameter && value[1] === defaultParameter[1]) {
            value[1] = null;
        }

        const defaultValidParameter = parameter.find(
            (p) => p[0] === SysConfigOptionDefinitionProperty.DEFAULT_VALID_ID
        );
        const valid = parameter.find((p) => p[0] === KIXObjectProperty.VALID_ID);
        if (valid && defaultValidParameter && valid[1] === defaultValidParameter[1]) {
            valid[1] = null;
        }

        parameter = parameter.filter((p) => {
            return p[0] !== SysConfigOptionDefinitionProperty.DEFAULT
                && p[0] !== SysConfigOptionDefinitionProperty.NAME
                && p[0] !== SysConfigOptionDefinitionProperty.DESCRIPTION;
        });

        return super.postPrepareValues(parameter, createOptions, formContext, formInstance);
    }
}
