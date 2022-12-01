/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { IdService } from '../../../../../model/IdService';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { ReportDefinition } from '../../../model/ReportDefinition';
import { ReportDefinitionProperty } from '../../../model/ReportDefinitionProperty';
import { ReportParameterProperty } from '../../../model/ReportParameterProperty';

export class ReportDefintionObjectCreator {

    public static async createReportDefinitionObject(formInstance: FormInstance): Promise<ReportDefinition> {
        const reportDefinition = new ReportDefinition();

        const nameValue = await formInstance.getFormFieldValueByProperty<string>(ReportDefinitionProperty.NAME);
        reportDefinition.Name = nameValue && nameValue.value
            ? nameValue.value
            : IdService.generateDateBasedId('Report - ');

        const isPeriodicValue = await formInstance.getFormFieldValueByProperty<number>(
            ReportDefinitionProperty.IS_PERIODIC
        );
        reportDefinition.IsPeriodic = isPeriodicValue && isPeriodicValue.value ? isPeriodicValue.value : 0;

        const maxReportsValue = await formInstance.getFormFieldValueByProperty<number>(
            ReportDefinitionProperty.MAX_REPORTS
        );
        reportDefinition.MaxReports = Number(maxReportsValue?.value) || 0;

        const commentValue = await formInstance.getFormFieldValueByProperty<string>(ReportDefinitionProperty.COMMENT);
        reportDefinition.Comment = commentValue && commentValue.value ? commentValue.value : '';

        const validValue = await formInstance.getFormFieldValueByProperty<number>(ReportDefinitionProperty.VALID_ID);
        reportDefinition.ValidID = validValue ? validValue.value : 2;

        const dataSourceParameter = await formInstance.getFormFieldValueByProperty<string>(
            ReportDefinitionProperty.DATASOURCE
        );
        reportDefinition.DataSource = dataSourceParameter ? dataSourceParameter.value : '';

        reportDefinition.Config = {};

        const dataSourceConfig = await this.getDataSourceConfig(formInstance);
        reportDefinition.Config['DataSource'] = dataSourceConfig;

        const outputFormatsConfig = await this.getOutputFormatsConfig(formInstance);
        if (outputFormatsConfig) {
            reportDefinition.Config['OutputFormats'] = outputFormatsConfig;
        }

        const configTitleParameter = await formInstance.getFormFieldValueByProperty<string>(
            ReportDefinitionProperty.CONFIG_TITLE
        );
        reportDefinition.Config['Title'] = configTitleParameter?.value;

        const parameterConfig = await this.getParameterConfig(formInstance);
        if (Array.isArray(parameterConfig) && parameterConfig.length) {
            reportDefinition.Config['Parameters'] = parameterConfig;
        }

        return reportDefinition;
    }

    private static async getParameterConfig(formInstance: FormInstance): Promise<any[]> {
        const parameterResult = [];
        const parameterFields = formInstance.getFormFieldsByProperty(ReportDefinitionProperty.PARAMTER);
        for (const field of parameterFields) {
            if (!field.children.length) {
                continue;
            }

            const parameter = {};

            const nameValue = this.getParamterValue(formInstance, field.children, ReportParameterProperty.NAME);
            parameter[ReportParameterProperty.NAME] = nameValue;

            const labelValue = this.getParamterValue(formInstance, field.children, ReportParameterProperty.LABEL);
            parameter[ReportParameterProperty.LABEL] = labelValue;

            const descriptionValue = this.getParamterValue(
                formInstance, field.children, ReportParameterProperty.DESCRIPTION
            );
            parameter[ReportParameterProperty.DESCRIPTION] = descriptionValue;

            let dataTypeValue = this.getParamterValue(formInstance, field.children, ReportParameterProperty.DATA_TYPE);
            if (Array.isArray(dataTypeValue)) {
                dataTypeValue = dataTypeValue[0];
            }
            parameter[ReportParameterProperty.DATA_TYPE] = dataTypeValue;

            const requiredValue = this.getParamterValue(formInstance, field.children, ReportParameterProperty.REQUIRED);
            parameter[ReportParameterProperty.REQUIRED] = requiredValue ? 1 : 0;

            const multipleValue = this.getParamterValue(formInstance, field.children, ReportParameterProperty.MULTIPLE);
            parameter[ReportParameterProperty.MULTIPLE] = multipleValue ? 1 : 0;

            const readonlyValue = this.getParamterValue(
                formInstance, field.children, ReportParameterProperty.READ_ONLY
            );
            parameter[ReportParameterProperty.READ_ONLY] = readonlyValue ? 1 : 0;

            const referencesValue = this.getParamterValue(
                formInstance, field.children, ReportParameterProperty.REFERENCES
            );
            parameter[ReportParameterProperty.REFERENCES] = referencesValue;

            const defaultValue = this.getParamterValue(
                formInstance, field.children, ReportParameterProperty.DEFAULT
            );
            parameter[ReportParameterProperty.DEFAULT] = defaultValue;

            let possibleValuesValue = this.getParamterValue(
                formInstance, field.children, ReportParameterProperty.POSSIBLE_VALUES
            );
            if (typeof possibleValuesValue === 'string') {
                possibleValuesValue = possibleValuesValue.split(',').map((s) => s.trim());
            }
            parameter[ReportParameterProperty.POSSIBLE_VALUES] = possibleValuesValue;

            parameterResult.push(parameter);
        }

        return parameterResult;
    }

    private static getParamterValue(
        formInstance: FormInstance, fields: FormFieldConfiguration[], parameter: string
    ): any {
        let value: any;

        const field = fields.find((f) => f.property === parameter);
        if (field) {
            const formValue = formInstance.getFormFieldValue(field.instanceId);
            value = formValue ? formValue.value : null;
        }

        return value;
    }

    private static async getDataSourceConfig(formInstance: FormInstance): Promise<any> {
        const dataSourceConfig = {};

        const outputHandlerValue = await formInstance.getFormFieldValueByProperty<string>('OutputHandler');
        if (outputHandlerValue && outputHandlerValue.value) {
            dataSourceConfig['OutputHandler'] = JSON.parse(outputHandlerValue.value);
        }

        const sqlParameter = {};

        const dbmsFields = formInstance.getFormFieldsByProperty('DBMS');
        for (const field of dbmsFields) {

            const dbmsValue = formInstance.getFormFieldValue<string>(field.instanceId);
            if (dbmsValue && dbmsValue.value) {
                for (const parameterField of field.children) {
                    const formValue = formInstance.getFormFieldValue<string>(parameterField.instanceId);
                    const dsValue = {};
                    dsValue[dbmsValue.value] = formValue.value;

                    if (parameterField.property === 'SQL') {
                        const value = Buffer.from(formValue.value, 'binary').toString('base64');
                        sqlParameter[dbmsValue.value] = `base64(${value})`;
                    }
                }
            }
        }

        dataSourceConfig['SQL'] = sqlParameter;

        return dataSourceConfig;
    }

    private static async getOutputFormatsConfig(formInstance: FormInstance): Promise<any> {
        const outputFormatsConfig = {};
        let hasOutputConfiguration = false;

        const fields = formInstance.getFormFieldsByProperty(ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS);
        if (Array.isArray(fields) && fields.length) {
            for (const formField of fields) {
                const config = {};

                if (formField && Array.isArray(formField.children)) {
                    for (const parameterField of formField.children) {
                        const formValue = formInstance.getFormFieldValue(parameterField.instanceId);
                        if (formValue && formValue.value) {
                            const value = await this.handleOutputFormatParameterValue(
                                parameterField.property, formValue.value
                            );

                            if (value) {
                                config[parameterField.property] = value;
                            }
                        }
                    }
                }

                const outputValue = formInstance.getFormFieldValue<string>(formField.instanceId);
                if (outputValue && outputValue.value) {
                    outputFormatsConfig[outputValue.value] = config;
                    hasOutputConfiguration = true;
                }
            }
        }

        return hasOutputConfiguration ? outputFormatsConfig : null;
    }

    private static async handleOutputFormatParameterValue(property: string, value: any): Promise<any> {
        let result = value;
        if (property === 'Columns') {
            const columns = value ? value.split(',').map((s) => s.trim()) : [];
            result = columns;
        }

        return result;
    }
}
