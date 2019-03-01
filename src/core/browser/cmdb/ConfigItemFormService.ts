import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import {
    KIXObjectType, FormFieldValue,
    Form, FormField, ConfigItem, VersionProperty, ConfigItemProperty,
    GeneralCatalogItem, KIXObjectLoadingOptions, FilterCriteria, FilterDataType,
    FilterType, ConfigItemClass, Contact, Customer, FormFieldOptions, InputFieldTypes
} from "../../model";
import { KIXObjectService } from '../kix/';
import { LabelService } from "../LabelService";
import { SearchOperator } from "../SearchOperator";
import { PreparedData } from "../../model/kix/cmdb/PreparedData";

export class ConfigItemFormService extends KIXObjectFormService<ConfigItem> {

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

    public async prepareFormFieldValues(
        formFields: FormField[], configItem: ConfigItem, formFieldValues: Map<string, FormFieldValue<any>>
    ): Promise<void> {
        if (configItem) {
            const fields = await this.prepareConfigItemValues(configItem, formFields, formFieldValues);
            formFields.splice(0, formFields.length);
            fields.forEach((f) => formFields.push(f));
        } else {
            for (const f of formFields) {
                let formFieldValue: FormFieldValue;
                if (f.defaultValue) {
                    const value = await this.getValue(
                        f.property,
                        f.defaultValue.value,
                        null
                    );
                    formFieldValue = new FormFieldValue(value, f.defaultValue.valid);
                } else {
                    formFieldValue = new FormFieldValue(null);
                }
                formFieldValues.set(f.instanceId, formFieldValue);
                if (f.children) {
                    await this.prepareFormFieldValues(f.children, null, formFieldValues);
                }
            }
        }
    }

    private async prepareConfigItemValues(
        configItem: ConfigItem, formFields: FormField[], formFieldValues: Map<string, FormFieldValue<any>>
    ): Promise<FormField[]> {
        let newFormFields: FormField[] = [];
        for (const formField of formFields) {
            if (configItem[formField.property]) {
                newFormFields.push(formField);
                await this.getConfigItemValue(formField, configItem[formField.property], configItem, formFieldValues);
            } else if (configItem.CurrentVersion) {
                if (configItem.CurrentVersion[formField.property]) {
                    newFormFields.push(formField);
                    await this.getConfigItemValue(
                        formField, configItem.CurrentVersion[formField.property], configItem, formFieldValues
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
        formField: FormField, value: any, configItem: ConfigItem, formFieldValues: Map<string, FormFieldValue<any>>
    ): Promise<void> {
        const newValue = await this.getValue(
            formField.property,
            value,
            configItem
        );
        const formFieldValue = new FormFieldValue(newValue);
        formFieldValues.set(formField.instanceId, formFieldValue);
        if (formField.children) {
            await this.prepareConfigItemValues(configItem, formField.children, formFieldValues);
        }
    }

    protected async getValue(property: string, value: any, configItem: ConfigItem): Promise<any> {
        if (value) {
            switch (property) {
                case ConfigItemProperty.CLASS_ID:
                    if (configItem) {
                        value = LabelService.getInstance().getPropertyValueDisplayText(configItem, property);
                    } else {
                        const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
                            KIXObjectType.CONFIG_ITEM_CLASS, [value], null
                        );
                        if (ciClasses && !!ciClasses.length) {
                            value = ciClasses[0].Name;
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
                    const loadingOptions = new KIXObjectLoadingOptions(null, [new FilterCriteria(
                        'Class', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, classId
                    )]);

                    const items = await KIXObjectService.loadObjects<GeneralCatalogItem>(
                        KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions, null, false
                    );
                    const item = items.find((i) => i.ItemID === value);
                    value = item ? item : null;
                    break;
                default:
            }
        }
        return value;
    }

    private async prepareDataValues(
        preparedData: PreparedData[], formField: FormField, formFieldValues: Map<string, FormFieldValue<any>>
    ): Promise<FormField[]> {
        const formFields: FormField[] = [];
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
        ff: FormField, pd: PreparedData, index: number, formFieldValues: Map<string, FormFieldValue<any>>
    ): Promise<void> {
        let value = await this.getDataValue(ff, pd);
        if (ff.options && !!ff.options.length) {
            const typeOption = ff.options.find((o) => o.option === FormFieldOptions.INPUT_FIELD_TYPE);
            if (typeOption && typeOption.value === InputFieldTypes.ATTACHMENT) {
                value = [value];
            }
        }
        formFieldValues.set(ff.instanceId, new FormFieldValue(value));
    }

    private async setDataChildren(
        ff: FormField, pd: PreparedData, formFieldValues: Map<string, FormFieldValue<any>>
    ): Promise<void> {
        if (ff.children && ff.children.length) {
            let newChildren: FormField[] = [];
            for (const child of ff.children) {
                const children = await this.prepareDataValues(
                    pd.Sub ? pd.Sub : [], child, formFieldValues
                );
                newChildren = [...newChildren, ...children];
            }
            ff.children = newChildren;
        }
    }

    private async setEmptyField(ff: FormField, formFieldValues: Map<string, FormFieldValue<any>>): Promise<void> {
        formFieldValues.set(ff.instanceId, new FormFieldValue(null));
        if (ff.children && ff.children.length) {
            let newChildren: FormField[] = [];
            for (const child of ff.children) {
                const children = await this.prepareDataValues([], child, formFieldValues);
                newChildren = [...newChildren, ...children];
            }
            ff.children = newChildren;
        }
    }

    private async getDataValue(formField: FormField, preparedData: PreparedData): Promise<any> {
        let value;
        switch (preparedData.Type) {
            case 'GeneralCatalog':
                const gcItem = await KIXObjectService.loadObjects<GeneralCatalogItem>(
                    KIXObjectType.GENERAL_CATALOG_ITEM, [Number(preparedData.Value)], null, null, false
                );
                if (gcItem && !!gcItem.length) {
                    value = gcItem[0];
                } else {
                    value = new GeneralCatalogItem();
                    value.ItemID = preparedData.Value;
                    value.ObjectId = preparedData.Value;
                    value.Name = preparedData.DisplayValue;
                }
                break;
            case 'Contact':
                const contacts = await KIXObjectService.loadObjects<Contact>(
                    KIXObjectType.CONTACT, [preparedData.Value], null
                );
                if (contacts && !!contacts.length) {
                    value = contacts[0].ContactID;
                } else {
                    value = new Contact();
                    value.ContactID = preparedData.Value;
                    value.ObjectId = preparedData.Value;
                    value.DisplayValue = preparedData.DisplayValue;
                }
                break;
            case 'Customer':
                const customers = await KIXObjectService.loadObjects<Customer>(
                    KIXObjectType.CUSTOMER, [preparedData.Value], null
                );
                if (customers && !!customers.length) {
                    value = customers[0].CustomerID;
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
}
