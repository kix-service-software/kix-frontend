/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../../../../modules/base-components/webapp/core/KIXObjectFormService";
import { ConfigItem } from "../../model/ConfigItem";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { FormConfiguration } from "../../../../model/configuration/FormConfiguration";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { ContextType } from "../../../../model/ContextType";
import { ConfigItemFormFactory } from ".";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { FormFieldValue } from "../../../../model/configuration/FormFieldValue";
import { FormContext } from "../../../../model/configuration/FormContext";
import { ConfigItemProperty } from "../../model/ConfigItemProperty";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { KIXObjectService } from "../../../../modules/base-components/webapp/core/KIXObjectService";
import { ConfigItemClass } from "../../model/ConfigItemClass";
import { VersionProperty } from "../../model/VersionProperty";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";
import { GeneralCatalogItem } from "../../../general-catalog/model/GeneralCatalogItem";
import { PreparedData } from "../../model/PreparedData";
import { FormFieldOptions } from "../../../../model/configuration/FormFieldOptions";
import { InputFieldTypes } from "../../../../modules/base-components/webapp/core/InputFieldTypes";
import { Contact } from "../../../customer/model/Contact";
import { Organisation } from "../../../customer/model/Organisation";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { TranslationService } from "../../../translation/webapp/core/TranslationService";

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

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.CONFIG_ITEM || kixObjectType === KIXObjectType.CONFIG_ITEM_VERSION;
    }

    protected async prePrepareForm(form: FormConfiguration): Promise<void> {
        if (form) {
            const context = ContextService.getInstance().getActiveContext();
            if (context.getDescriptor().contextType === ContextType.DIALOG && form.formContext !== FormContext.LINK) {
                const ciClassId = context.getAdditionalInformation('CI_CLASS_ID');
                await ConfigItemFormFactory.getInstance().addCIClassAttributesToForm(form, ciClassId);
            }
        }
    }

    public async prepareFormFieldValues(
        formFields: FormFieldConfiguration[], configItem: ConfigItem, formFieldValues: Map<string, FormFieldValue<any>>,
        formContext: FormContext
    ): Promise<void> {
        if (configItem || formContext === FormContext.EDIT) {
            const fields = await this.prepareConfigItemValues(configItem, formFields, formFieldValues, formContext);
            formFields.splice(0, formFields.length);
            fields.forEach((f) => formFields.push(f));
        } else {
            this.handleCountValues(formFields);
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
                    await this.prepareFormFieldValues(f.children, configItem, formFieldValues, formContext);
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
            switch (property) {
                case ConfigItemProperty.NAME:
                    if (formContext === FormContext.NEW) {
                        const ciName = await TranslationService.translate(
                            'Translatable#Copy of {0}', [value]
                        );
                        value = ciName;
                    }
                    break;
                case KIXObjectProperty.LINKS:
                    if (formContext === FormContext.NEW) {
                        value = [];
                    }
                    break;
                case ConfigItemProperty.CLASS_ID:
                    if (configItem) {
                        value = LabelService.getInstance().getPropertyValueDisplayText(configItem, property);
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
        if (!!relevantPreparedData.length) {
            let index = 0;
            for (const pd of relevantPreparedData) {
                if (index < ff.countMax) {
                    if (index > 0) {
                        ff = this.getNewFormField(formField);
                        formFields.push(ff);
                    }
                    await this.setDataValue(ff, pd, index, formFieldValues);
                    await this.setDataChildren(ff, pd, formFieldValues);
                }
                index++;
            }
        } else {
            await this.setEmptyField(ff, formFieldValues);
        }
        return formFields;
    }

    private async setDataValue(
        ff: FormFieldConfiguration, pd: PreparedData, index: number, formFieldValues: Map<string, FormFieldValue<any>>
    ): Promise<void> {
        let value = await this.getDataValue(ff, pd);
        if (value && value !== '') {
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

    private async getDataValue(formField: FormFieldConfiguration, preparedData: PreparedData): Promise<any> {
        let value;
        switch (preparedData.Type) {
            case 'GeneralCatalog':
                const gcItem = await KIXObjectService.loadObjects<GeneralCatalogItem>(
                    KIXObjectType.GENERAL_CATALOG_ITEM, [Number(preparedData.Value)], null, null, false
                );
                if (gcItem && !!gcItem.length) {
                    value = gcItem[0].ItemID;
                } else {
                    value = preparedData.Value;
                }
                break;
            case 'Contact':
                const contacts = await KIXObjectService.loadObjects<Contact>(
                    KIXObjectType.CONTACT, [preparedData.Value], null
                );
                value = contacts && !!contacts.length ? preparedData.Value : null;
                break;
            case 'Organisation':
                const organisations = await KIXObjectService.loadObjects<Organisation>(
                    KIXObjectType.ORGANISATION, [preparedData.Value], null
                );
                if (organisations && !!organisations.length) {
                    value = organisations[0].ID;
                } else {
                    value = preparedData.Value;
                }
                break;
            case 'CIClassReference':
                const configItems = await KIXObjectService.loadObjects<ConfigItem>(
                    KIXObjectType.CONFIG_ITEM, [Number(preparedData.Value)], null, null, false
                );
                if (configItems && !!configItems.length) {
                    value = configItems[0].ConfigItemID;
                } else {
                    value = preparedData.Value;
                }
                break;
            case 'Date':
            case 'DateTime':
            case 'Attachment':
                value = preparedData.Value;
                break;
            default:
                value = preparedData.DisplayValue;
        }
        return value;
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
}
