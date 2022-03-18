/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { GeneralCatalogItem } from '../../model/GeneralCatalogItem';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormContext } from '../../../../model/configuration/FormContext';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { DefaultSelectInputFormOption } from '../../../../model/configuration/DefaultSelectInputFormOption';
import { IdService } from '../../../../model/IdService';
import { GeneralCatalogItemProperty } from '../../model/GeneralCatalogItemProperty';
import { GeneralCatalogItemPreferenceConfig } from '../../model/GeneralCatalogItemPreferenceConfig';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { GeneralCatalogItemPreference } from '../../model/GeneralCatalogItemPreference';

export class GeneralCatalogFormService extends KIXObjectFormService {

    private static INSTANCE: GeneralCatalogFormService = null;

    public static getInstance(): GeneralCatalogFormService {
        if (!GeneralCatalogFormService.INSTANCE) {
            GeneralCatalogFormService.INSTANCE = new GeneralCatalogFormService();
        }
        return GeneralCatalogFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.GENERAL_CATALOG_ITEM;
    }

    protected async postPrepareForm(
        form: FormConfiguration, formInstance: FormInstance,
        formFieldValues: Map<string, FormFieldValue<any>>, gcItem: GeneralCatalogItem
    ): Promise<void> {
        if (form.formContext === FormContext.EDIT && gcItem) {

            // TODO: only handle "Functionality" preference for the moment
            if (
                gcItem.Class === 'ITSM::ConfigItem::DeploymentState' ||
                gcItem.Class === 'ITSM::Core::IncidentState'
            ) {
                const fieldInstanceId = await this.setFunctionalityField(formInstance, gcItem.Class);
                if (fieldInstanceId) {
                    if (Array.isArray(gcItem.Preferences)) {
                        const functionalityPref = gcItem.Preferences.find((p) => p.Name === 'Functionality');
                        if (functionalityPref) {
                            formFieldValues.set(fieldInstanceId, new FormFieldValue(functionalityPref.Value));
                        }
                    }
                }
            }
        }
    }

    public async setFunctionalityField(formInstance: FormInstance, classValue: string): Promise<string> {
        let fieldInstanceId: string;

        let existingField = formInstance.getFormFieldByProperty('Functionality');
        if (existingField && existingField.id !== `${classValue}-Functionality`) {
            formInstance.removeFormField(existingField);
            existingField = null;
        }

        if (!existingField) {
            const functionalityPref = await this.getFunctionalityPref(classValue);
            if (functionalityPref) {
                const label = await TranslationService.translate(functionalityPref.Label);
                const hint = await TranslationService.translate(functionalityPref.Desc);
                const nodes = [];
                if (typeof functionalityPref.Data === 'object') {
                    for (const [key, value] of Object.entries(functionalityPref.Data)) {
                        nodes.push(
                            new TreeNode(key, value.toString())
                        );
                    }
                }
                const funtionalityField = new FormFieldConfiguration(
                    `${classValue}-Functionality`,
                    label, 'Pref::Functionality', 'default-select-input', true,
                    hint, [new FormFieldOption(DefaultSelectInputFormOption.NODES, nodes)]
                );
                funtionalityField.instanceId = IdService.generateDateBasedId(`${classValue}-Functionality-`);
                fieldInstanceId = funtionalityField.instanceId;

                const classField = formInstance.getFormFieldByProperty(GeneralCatalogItemProperty.CLASS);
                if (classField) {
                    formInstance.addFieldChildren(classField, [funtionalityField]);
                }
            }
        } else {
            fieldInstanceId = existingField.instanceId;
        }

        return fieldInstanceId;
    }

    private async getFunctionalityPref(classValue: string): Promise<GeneralCatalogItemPreferenceConfig> {
        let functionalityPref: GeneralCatalogItemPreferenceConfig;
        const preferenceConfigs = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.GENERAL_CATALOG_PREFERENCES],
            undefined, undefined, true
        ).catch(() => [] as SysConfigOption[]);
        if (preferenceConfigs?.length && typeof preferenceConfigs[0].Value === 'object') {
            for (const [key, value] of Object.entries(preferenceConfigs[0].Value)) {
                if (
                    typeof value === 'object' && (value as GeneralCatalogItemPreferenceConfig).Class === classValue
                    && (value as GeneralCatalogItemPreferenceConfig).PrefKey === 'Functionality'
                ) {
                    functionalityPref = (value as GeneralCatalogItemPreferenceConfig);
                    break;
                }
            }
        }
        return functionalityPref;
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        formContext?: FormContext, formInstance?: FormInstance
    ): Promise<Array<[string, any]>> {
        const preferenceParameter = parameter.filter((p) => p[0].match(/^Pref::/));
        if (preferenceParameter) {
            const preferences: GeneralCatalogItemPreference[] = preferenceParameter.map((pp) => {
                const prefKey = pp[0].replace(/^Pref::(.+)/, '$1');

                // TODO: prepare value based on preference?
                return new GeneralCatalogItemPreference(prefKey, Array.isArray(pp[1]) ? pp[1][0] : pp[1]);
            });
            parameter = parameter.filter((p) => !preferenceParameter.some((pp) => p[0] === pp[0]));
            parameter.push([GeneralCatalogItemProperty.PREFERENCES, preferences]);
        }

        return super.postPrepareValues(parameter, createOptions, formContext, formInstance);
    }


}
