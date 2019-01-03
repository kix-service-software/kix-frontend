import {
    VersionProperty, FormField,
    FormFieldOptions, InputFieldTypes, KIXObjectType, Contact, Customer,
    IFormInstance, DateTimeUtil, Attachment
} from "../../model";
import { FormService } from "../form";
import { BrowserUtil } from "../BrowserUtil";

export class CreateConfigItemVersionUtil {

    public static async createParameter(formId: string): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];


        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const form = formInstance.getForm();

        let fields: FormField[] = [];
        form.groups.forEach((g) => fields = [...fields, ...g.formFields]);

        const data: any = {};
        for (const formField of fields) {
            const property = formField.property;
            const formValue = formInstance.getFormFieldValue(formField.instanceId);
            const value = formValue ? formValue.value : null;
            switch (property) {
                case VersionProperty.NAME:
                    parameter.push([property, value]);
                    break;
                case VersionProperty.DEPL_STATE_ID:
                    parameter.push([property, value]);
                    break;
                case VersionProperty.INCI_STATE_ID:
                    parameter.push([property, value]);
                    break;
                default:
                    // Try to add the field to the version data
                    await CreateConfigItemVersionUtil.prepareData(data, formField, formInstance);
            }
        }

        parameter.push([VersionProperty.DATA, data]);

        return parameter;
    }

    private static async prepareData(
        versionData: any, formField: FormField, formInstance: IFormInstance
    ): Promise<void> {
        const data = await CreateConfigItemVersionUtil.perpareFormFieldData(formField, formInstance);
        if (data) {
            if (formField.countMax > 1) {
                if (!versionData[formField.property]) {
                    versionData[formField.property] = [data];
                } else {
                    versionData[formField.property] = [...versionData[formField.property], data];
                }
            } else {
                versionData[formField.property] = data;
            }
        }
    }

    private static async perpareFormFieldData(
        formField: FormField, formInstance: IFormInstance
    ): Promise<any> {
        let data;
        let fieldType: string;
        if (formField.options) {
            const option = formField.options.find((o) => o.option === FormFieldOptions.INPUT_FIELD_TYPE);
            if (option) {
                fieldType = option.value as string;
            }
        }

        if (!formField.empty || fieldType === InputFieldTypes.DUMMY) {
            const formValue = formInstance.getFormFieldValue(formField.instanceId);


            let value;
            if (formValue && formValue.value) {
                switch (fieldType) {
                    case InputFieldTypes.TEXT:
                    case InputFieldTypes.TEXT_AREA:
                        value = formValue.value;
                        break;
                    case InputFieldTypes.GENERAL_CATALOG:
                        value = formValue.value;
                        break;
                    case InputFieldTypes.CI_REFERENCE:
                        value = formValue.value;
                        break;
                    case InputFieldTypes.OBJECT_REFERENCE:
                        const objectoption = formField.options.find((o) => o.option === 'OBJECT');
                        if (objectoption) {
                            if (objectoption.value === KIXObjectType.CONTACT) {
                                value = (formValue.value as Contact).ContactID;
                            } else if (objectoption.value === KIXObjectType.CUSTOMER) {
                                value = (formValue.value as Customer).CustomerID;
                            }
                        }
                        break;
                    case InputFieldTypes.DATE:
                        if (formValue.value !== '') {
                            value = DateTimeUtil.getKIXDateString(formValue.value as Date);
                        }
                        break;
                    case InputFieldTypes.DATE_TIME:
                        if (formValue.value !== '') {
                            value = DateTimeUtil.getKIXDateTimeString(formValue.value as Date);
                        }
                        break;
                    case InputFieldTypes.ATTACHMENT:
                        value = await CreateConfigItemVersionUtil.prepareAttachment(formValue.value as File[]);
                        break;
                    case InputFieldTypes.DUMMY:
                    default:
                        value = null;
                }
            }

            if (value) {
                data = value;
            }

            if (formField.children && formField.children.length > 0) {
                const subDataEntries: Map<string, any | any[]> = new Map();

                for (const f of formField.children) {
                    const subData = await CreateConfigItemVersionUtil.perpareFormFieldData(f, formInstance);
                    if (subData) {
                        if (f.countMax > 1 && !subDataEntries.has(f.property)) {
                            subDataEntries.set(f.property, []);
                        }
                        if (subDataEntries.has(f.property)) {
                            subDataEntries.get(f.property).push(subData);
                        } else {
                            subDataEntries.set(f.property, subData);
                        }
                    }
                }

                data = null;
                if (value) {
                    data = {};
                    data[formField.property] = value;
                }

                if (subDataEntries.size > 0) {
                    if (!data) {
                        data = {};
                    }
                    subDataEntries.forEach((subData, property) => {
                        data[property] = subData;
                    });
                }
            }
        }

        return data;
    }

    private static async prepareAttachment(files: Array<File | Attachment>): Promise<any> {
        let attachment;
        if (files && Array.isArray(files) && !!files.length) {
            if (files[0] instanceof File) {
                const file = files[0] as File;
                const contentType = file.type && file.type !== '' ? file.type : 'text/plain';
                attachment = {
                    Filename: file.name,
                    ContentType: contentType,
                    Content: await BrowserUtil.readFile(file)
                };
            } else {
                attachment = files[0];
            }
        }

        return attachment;
    }

}
