/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { DateTimeUtil } from '../../../../base-components/webapp/core/DateTimeUtil';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { Report } from '../../../model/Report';
import { ReportDefinition } from '../../../model/ReportDefinition';
import { ReportDefinitionProperty } from '../../../model/ReportDefinitionProperty';
import { ReportParameter } from '../../../model/ReportParamater';
import { ReportProperty } from '../../../model/ReportProperty';

export class ReportObjectCreator {

    public static async createReportObject(formInstance: FormInstance, definition: ReportDefinition): Promise<Report> {
        const report = new Report();
        report.DefinitionID = definition.ID;
        report.Config = {};
        if (formInstance) {
            report.Config['OutputFormats'] = this.getOutputFormats(formInstance);
            report.Config['Parameters'] = await this.getParameters(formInstance, definition);
        }

        return report;
    }

    private static getOutputFormats(formInstance: FormInstance): string[] {
        let formats = [];

        const field = formInstance.getFormFieldByProperty(ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS);
        const formValue = formInstance.getFormFieldValue<string[]>(field?.instanceId);
        if (formValue && formValue.value) {
            formats = Array.isArray(formValue.value) ? formValue.value : [formValue.value];
        }

        return formats;
    }

    private static async getParameters(formInstance: FormInstance, definition: ReportDefinition): Promise<any> {
        const parameterFields = formInstance.getFormFieldsByProperty(ReportProperty.PARAMETER) || [];
        const parameters = await this.getParameterConfig(parameterFields, formInstance, definition);
        return parameters;
    }

    public static async getParameterConfig(
        parameterFields: FormFieldConfiguration[], formInstance: FormInstance, definition: ReportDefinition
    ): Promise<any> {
        const parameters = {};

        for (const field of parameterFields) {
            const formValue = formInstance.getFormFieldValue(field.instanceId);
            if (formValue) {
                const parameterValue = await this.getParameterValue(field.id, formValue.value, definition);
                parameters[field.id] = parameterValue;
            }
        }

        return parameters;
    }

    private static async getParameterValue(
        parameterName: string, value: any, definition: ReportDefinition
    ): Promise<any> {
        if (Array.isArray(definition.Config['Parameters'])) {
            const parameter: ReportParameter = definition.Config['Parameters'].find(
                (p: ReportParameter) => p.Name === parameterName
            );
            if (parameter && parameter.References) {
                const parts = parameter.References.split('.');
                if (parts.length >= 2) {
                    const object = parts[0];
                    const property = parts[1];

                    if (object !== 'DynamicField') {
                        const ids = Array.isArray(value) ? value : [value];
                        const objects = await KIXObjectService.loadObjects(object, ids).catch((error): KIXObject[] => {
                            console.error(error);
                            return [];
                        });

                        if (objects && objects.length) {
                            if (parameter.Multiple) {
                                value = objects.map((o) => o[property]);
                            } else {
                                value = objects[0][property];
                            }
                        }
                    }
                }
            } else if (parameter.DataType === 'DATE' && value) {
                value = DateTimeUtil.getKIXDateString(value);
            }
            else if (parameter.DataType === 'DATETIME' && value) {
                value = DateTimeUtil.getKIXDateTimeString(value);
            }
            else if (parameter.DataType === 'TIME' && value) {
                value = DateTimeUtil.getKIXTimeString(value);
            }
        }

        return value;
    }

}