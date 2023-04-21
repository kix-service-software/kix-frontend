/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { ConfigItem } from '../../model/ConfigItem';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormContext } from '../../../../model/configuration/FormContext';
import { ConfigItemProperty } from '../../model/ConfigItemProperty';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { ConfigItemClass } from '../../model/ConfigItemClass';
import { VersionProperty } from '../../model/VersionProperty';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { GeneralCatalogItem } from '../../../general-catalog/model/GeneralCatalogItem';
import { PreparedData } from '../../model/PreparedData';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { InputFieldTypes } from '../../../../modules/base-components/webapp/core/InputFieldTypes';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ConfigItemImage } from '../../model/ConfigItemImage';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { Version } from '../../model/Version';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { CreateConfigItemVersionUtil } from './CreateConfigItemVersionUtil';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { ConfigItemFormFactory } from './ConfigItemFormFactory';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { AdditionalContextInformation } from '../../../base-components/webapp/core/AdditionalContextInformation';

export class ConfigItemFormService extends KIXObjectFormService {

    private static INSTANCE: ConfigItemFormService = null;

    public static getInstance(): ConfigItemFormService {
        if (!ConfigItemFormService.INSTANCE) {
            ConfigItemFormService.INSTANCE = new ConfigItemFormService();
        }
        return ConfigItemFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONFIG_ITEM || kixObjectType === KIXObjectType.CONFIG_ITEM_VERSION;
    }

    protected async prePrepareForm(form: FormConfiguration): Promise<void> {
        if (form && form.formContext === FormContext.EDIT) {
            const context = ContextService.getInstance().getActiveContext();
            const configItem = await context.getObject<ConfigItem>();
            await ConfigItemFormFactory.getInstance().addCIClassAttributesToForm(form, configItem.ClassID);
        }
    }


    public async prepareFormFieldValues(
        formFields: FormFieldConfiguration[], configItem: ConfigItem, formFieldValues: Map<string, FormFieldValue<any>>,
        formContext: FormContext, formInstance: FormInstance
    ): Promise<void> {
        if (configItem || formContext === FormContext.EDIT) {
            const fields = await this.prepareConfigItemValues(configItem, formFields, formFieldValues, formContext);
            formFields.splice(0, formFields.length);
            fields.forEach((f) => formFields.push(f));
        } else {
            this.handleCountValues(formFields, formInstance);
            for (const f of formFields) {
                let formFieldValue: FormFieldValue;
                if (f.defaultValue) {
                    const value = await this.getValue(
                        f.property,
                        f.defaultValue.value,
                        configItem, f,
                        formContext
                    );
                    formFieldValue = new FormFieldValue(value, f.defaultValue.valid);
                } else {
                    formFieldValue = new FormFieldValue(null);
                }
                formFieldValues.set(f.instanceId, formFieldValue);
                if (f.children) {
                    await this.prepareFormFieldValues(
                        f.children, configItem, formFieldValues, formContext, formInstance
                    );
                }
            }
        }
    }

    private async prepareConfigItemValues(
        configItem: ConfigItem, formFields: FormFieldConfiguration[], formFieldValues: Map<string, FormFieldValue<any>>,
        formContext: FormContext
    ): Promise<FormFieldConfiguration[]> {
        let newFormFields: FormFieldConfiguration[] = [];
        for (const formField of formFields) {
            if (configItem[formField.property]) {
                newFormFields.push(formField);
                await this.getConfigItemValue(
                    formField, configItem[formField.property], configItem, formFieldValues, formContext
                );
            } else if (configItem.CurrentVersion) {
                if (configItem.CurrentVersion[formField.property]) {
                    newFormFields.push(formField);
                    await this.getConfigItemValue(
                        formField, configItem.CurrentVersion[formField.property], configItem, formFieldValues,
                        formContext
                    );
                } else {
                    newFormFields = [
                        ...newFormFields,
                        ...await this.prepareDataValues(
                            configItem.CurrentVersion.PreparedData, formField, formFieldValues
                        )
                    ];
                }
            } else {
                newFormFields.push(formField);
                formFieldValues.set(formField.instanceId, new FormFieldValue(null));
            }
        }
        return newFormFields;
    }

    private async getConfigItemValue(
        formField: FormFieldConfiguration, value: any,
        configItem: ConfigItem, formFieldValues: Map<string, FormFieldValue<any>>,
        formContext: FormContext
    ): Promise<void> {
        const newValue = await this.getValue(
            formField.property,
            value,
            configItem,
            formField,
            formContext
        );
        const formFieldValue = new FormFieldValue(newValue);
        formFieldValues.set(formField.instanceId, formFieldValue);
        if (formField.children) {
            await this.prepareConfigItemValues(configItem, formField.children, formFieldValues, formContext);
        }
    }

    protected async getValue(
        property: string, value: any, configItem: ConfigItem,
        formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        if (value) {
            const context = ContextService.getInstance().getActiveContext();
            const duplicate = context?.getAdditionalInformation(AdditionalContextInformation.DUPLICATE);
            switch (property) {
                case ConfigItemProperty.NAME:
                    if (formContext === FormContext.NEW) {
                        if (duplicate) {
                            const ciName = await TranslationService.translate(
                                'Translatable#Copy of {0}', [value]
                            );
                            value = ciName;
                        } else {
                            value = null;
                        }
                    }
                    break;
                case KIXObjectProperty.LINKS:
                    if (formContext === FormContext.NEW) {
                        value = [];
                    }
                    break;
                case ConfigItemProperty.CLASS_ID:
                    if (configItem) {
                        value = LabelService.getInstance().getDisplayText(configItem, property);
                    } else {
                        const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
                            KIXObjectType.CONFIG_ITEM_CLASS, [value], null
                        );
                        if (ciClasses && !!ciClasses.length) {
                            value = ciClasses[0].ID;
                        }
                    }
                    break;
                case ConfigItemProperty.CUR_DEPL_STATE_ID:
                case ConfigItemProperty.CUR_INCI_STATE_ID:
                case VersionProperty.DEPL_STATE_ID:
                case VersionProperty.INCI_STATE_ID:
                    const classId = property === ConfigItemProperty.CUR_DEPL_STATE_ID
                        || property === VersionProperty.DEPL_STATE_ID
                        ? 'ITSM::ConfigItem::DeploymentState'
                        : 'ITSM::Core::IncidentState';
                    const loadingOptions = new KIXObjectLoadingOptions([
                        new FilterCriteria(
                            'Class', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, classId
                        )
                    ]);

                    const items = await KIXObjectService.loadObjects<GeneralCatalogItem>(
                        KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions, null, false
                    );
                    const item = items.find((i) => i.ItemID === value);
                    value = item ? item.ItemID : null;
                    break;
                default:
            }
        }
        return value;
    }

    private async prepareDataValues(
        preparedData: PreparedData[], formField: FormFieldConfiguration,
        formFieldValues: Map<string, FormFieldValue<any>>
    ): Promise<FormFieldConfiguration[]> {
        const formFields: FormFieldConfiguration[] = [];
        const relevantPreparedData = preparedData.filter(
            (pd) => pd.Key === formField.property
        );
        let ff = formField;
        formFields.push(ff);
        if (relevantPreparedData.length) {
            let index = 0;
            for (const pd of relevantPreparedData) {
                if (index < ff.countMax) {
                    if (index > 0) {
                        ff = await this.getNewFormField(null, formField);
                        formFields.push(ff);
                    }
                    this.setDataValue(ff, pd, index, formFieldValues);
                    await this.setDataChildren(ff, pd, formFieldValues);
                }
                index++;
            }
        } else {
            await this.setEmptyField(ff, formFieldValues);
        }
        return formFields;
    }

    private setDataValue(
        ff: FormFieldConfiguration, pd: PreparedData, index: number, formFieldValues: Map<string, FormFieldValue<any>>
    ): void {
        let value = pd.Value;
        if (value && value !== '' && !ff.asStructure) {
            ff.empty = false;
        }

        if (ff.options && !!ff.options.length) {
            const typeOption = ff.options.find((o) => o.option === FormFieldOptions.INPUT_FIELD_TYPE);
            if (typeOption && typeOption.value === InputFieldTypes.ATTACHMENT) {
                value = [value];
            }
        }
        formFieldValues.set(ff.instanceId, new FormFieldValue(value));
    }

    private async setDataChildren(
        ff: FormFieldConfiguration, pd: PreparedData, formFieldValues: Map<string, FormFieldValue<any>>
    ): Promise<void> {
        if (ff.children && ff.children.length) {
            let newChildren: FormFieldConfiguration[] = [];
            for (const child of ff.children) {
                const children = await this.prepareDataValues(
                    pd.Sub ? pd.Sub : [], child, formFieldValues
                );
                newChildren = [...newChildren, ...children];
            }
            ff.children = newChildren;
        }
    }

    private async setEmptyField(
        ff: FormFieldConfiguration, formFieldValues: Map<string, FormFieldValue<any>>
    ): Promise<void> {
        formFieldValues.set(ff.instanceId, new FormFieldValue(null));
        if (ff.children && ff.children.length) {
            let newChildren: FormFieldConfiguration[] = [];
            for (const child of ff.children) {
                const children = await this.prepareDataValues([], child, formFieldValues);
                newChildren = [...newChildren, ...children];
            }
            ff.children = newChildren;
        }
    }

    public async hasPermissions(field: FormFieldConfiguration): Promise<boolean> {
        let hasPermissions = true;
        switch (field.property) {
            case ConfigItemProperty.CLASS_ID:
                hasPermissions = await this.checkPermissions('system/cmdb/classes');
                break;
            default:
        }
        return hasPermissions;
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions: KIXObjectSpecificCreateOptions,
        formContext: FormContext, formInstance: FormInstance
    ): Promise<Array<[string, any]>> {
        let parameterResult = [];
        if (formContext === FormContext.NEW && formInstance.getObjectType() === KIXObjectType.CONFIG_ITEM) {
            parameterResult = parameter.filter((p) => p[0] === ConfigItemProperty.CLASS_ID);

            for (const p of parameter) {
                const property = p[0];
                const formValue = p[1];
                const value = formValue ? formValue.value : null;
                switch (property) {
                    case ConfigItemProperty.IMAGES:
                        if (value) {
                            const images = await this.prepareImages(value as File[]);
                            if (Array.isArray(images) && images.length) {
                                parameterResult.push([ConfigItemProperty.IMAGES, images]);
                            }
                        }
                        break;
                    case KIXObjectProperty.LINKS:
                        parameterResult.push([property, value]);
                        break;
                    default:
                }
            }

            const version = new Version();
            const versionParameter = await CreateConfigItemVersionUtil.createParameter(formInstance);
            versionParameter.forEach((p) => {
                version[p[0]] = p[1];
            });
            parameterResult.push([ConfigItemProperty.VERSION, version]);
        } else if (formContext === FormContext.EDIT && formInstance.getObjectType() === KIXObjectType.CONFIG_ITEM) {
            parameterResult = await CreateConfigItemVersionUtil.createParameter(formInstance);
        }

        return parameterResult;
    }

    private async prepareImages(files: File[]): Promise<ConfigItemImage[]> {
        const images = [];
        for (const f of files) {
            if (f && f.name) {
                const image = new ConfigItemImage();
                image.Filename = f.name;
                image.Content = await BrowserUtil.readFile(f);
                image.ContentType = f.type;
                images.push(image);
            }
        }
        return images;
    }
}
