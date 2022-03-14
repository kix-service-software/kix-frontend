/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { VersionProperty } from '../../model/VersionProperty';
import { ConfigItemProperty } from '../../model/ConfigItemProperty';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { InputFieldTypes } from '../../../../modules/base-components/webapp/core/InputFieldTypes';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { Attachment } from '../../../../model/kix/Attachment';
import { BrowserUtil } from '../../../../modules/base-components/webapp/core/BrowserUtil';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';

export class CreateConfigItemVersionUtil {

    public static async createParameter(formInstance: FormInstance): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];

        const form = formInstance.getForm();

        let fields: FormFieldConfiguration[] = [];
        form.pages.forEach((p) => p.groups.forEach((g) => fields = [...fields, ...g.formFields]));

        let data = null;
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
                case ConfigItemProperty.CUR_INCI_STATE_ID:
                    parameter.push([VersionProperty.INCI_STATE_ID, value]);
                    break;
                case ConfigItemProperty.LINKS:
                case ConfigItemProperty.CLASS_ID:
                    continue;
                default:
                    data = await CreateConfigItemVersionUtil.prepareData(data, formField, formInstance);
            }
        }

        if (data) {
            parameter.push([VersionProperty.DATA, data]);
        }

        return parameter;
    }

    private static async prepareData(
        versionData: any, formField: FormFieldConfiguration, formInstance: FormInstance
    ): Promise<any> {
        const data = await CreateConfigItemVersionUtil.perpareFormFieldData(formField, formInstance);
        if (!versionData) {
            versionData = {};
        }
        if (formField.countMax > 1 && data) {
            if (!versionData[formField.property]) {
                versionData[formField.property] = [data];
            } else {
                versionData[formField.property] = [...versionData[formField.property], data];
            }
        } else {
            versionData[formField.property] = data;
        }
        return versionData;
    }

    private static async perpareFormFieldData(
        formField: FormFieldConfiguration, formInstance: FormInstance
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
                        value = null;
                        break;
                    default:
                        value = formValue.value;
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
