/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DefaultSelectInputFormOption } from '../../../../../model/configuration/DefaultSelectInputFormOption';
import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../../model/configuration/FormFieldOption';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../../../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../../../../model/configuration/FormPageConfiguration';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { InputFieldTypes } from '../../../../base-components/webapp/core/InputFieldTypes';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { ReportDefinition } from '../../../model/ReportDefinition';
import { ReportDefinitionProperty } from '../../../model/ReportDefinitionProperty';
import { ReportOutputFormat } from '../../../model/ReportOutputFormat';
import { ReportParameter } from '../../../model/ReportParamater';
import { ReportProperty } from '../../../model/ReportProperty';
import { ReportingFormUtil } from './ReportingFormUtil';

export class ReportFormCreator {

    public static async createFormPages(
        form: FormConfiguration, reportDefinition: ReportDefinition, outputFormat?: string
    ): Promise<void> {
        const parameterPage = await this.createPage(reportDefinition, outputFormat);
        form.pages.push(parameterPage);
    }

    private static async createPage(
        reportDefinition: ReportDefinition, outputFormat?: string
    ): Promise<FormPageConfiguration> {
        const outputFormatField = await this.createOutputFormatField(reportDefinition, outputFormat);
        const parameterFields = await this.createParameterFields(reportDefinition);

        const groupParmater = new FormGroupConfiguration(
            'report-parameter-group', 'Translatable#Paramater', [], null, [outputFormatField, ...parameterFields]
        );

        return new FormPageConfiguration(
            'report-parameter-page', 'Translatable#Report Parameter', [], true, false, [groupParmater]
        );
    }

    public static async createOutputFormatField(
        reportDefinition: ReportDefinition, outputFormat?: string
    ): Promise<FormFieldConfiguration> {
        const outputFormatField = new FormFieldConfiguration(
            'report-outputformats-outputformats', 'Translatable#Output Formats',
            ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS,
            'default-select-input', true, 'Translatable#Helptext_Reporting_Report_OutputFormats',
            [
                new FormFieldOption(DefaultSelectInputFormOption.MULTI, true)
            ]
        );
        outputFormatField.instanceId = IdService.generateDateBasedId();

        const nodes: TreeNode[] = [];
        if (reportDefinition?.Config['OutputFormats']) {
            for (const format in reportDefinition.Config['OutputFormats']) {
                if (reportDefinition.Config['OutputFormats'][format]) {
                    nodes.push(new TreeNode(format, format));
                }
            }
        }

        if (!nodes.length) {
            const outputFormats = await KIXObjectService.loadObjects<ReportOutputFormat>(
                KIXObjectType.REPORT_OUTPUT_FORMAT
            );

            if (Array.isArray(outputFormats)) {
                outputFormats.forEach((of) => nodes.push(new TreeNode(of.Name, of.DisplayName)));
            }
        }

        if (outputFormat) {
            outputFormatField.defaultValue = new FormFieldValue(
                Array.isArray(outputFormat) ? outputFormat : [outputFormat]
            );
        } else if (nodes.length) {
            outputFormatField.defaultValue = new FormFieldValue([nodes[0].id]);
        }

        outputFormatField.options.push(new FormFieldOption(DefaultSelectInputFormOption.NODES, nodes));
        return outputFormatField;
    }

    public static async createParameterFields(
        reportDefinition: ReportDefinition, defaultParameters?: any, allowPlaceholder?: boolean
    ): Promise<FormFieldConfiguration[]> {
        const fields: FormFieldConfiguration[] = [];
        if (reportDefinition.Config && Array.isArray(reportDefinition.Config['Parameters'])) {
            const parameters: ReportParameter[] = reportDefinition.Config['Parameters'];
            for (const parameter of parameters) {
                const field = new FormFieldConfiguration(
                    parameter.Name, parameter.Label, ReportProperty.PARAMETER, null,
                    Boolean(parameter.Required), parameter.Description, []
                );

                field.instanceId = IdService.generateDateBasedId();
                field.label = parameter.Label ? parameter.Label : parameter.Name;
                field.readonly = Boolean(parameter.ReadOnly);

                const defaultValue = defaultParameters
                    ? defaultParameters[parameter.Name]
                    : parameter.Default;

                field.defaultValue = new FormFieldValue(defaultValue);
                await this.prepareFieldInput(field, parameter, allowPlaceholder);

                fields.push(field);
            }
        }

        return fields;
    }

    private static async prepareFieldInput(
        field: FormFieldConfiguration, parameter: ReportParameter, allowPlaceholder?: boolean
    ): Promise<void> {
        if (parameter.DataType === 'number') {
            field.options.push(new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.NUMBER));
        } else if (parameter.DataType === 'DATE') {
            field.inputComponent = 'date-time-input';
            field.options.push(new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.DATE));
        } else if (parameter.DataType === 'DATETIME') {
            field.inputComponent = 'date-time-input';
            field.options.push(new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.DATE_TIME));
        } else if (parameter.DataType === 'TIME') {
            field.inputComponent = 'date-time-input';
            field.options.push(new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.TIME));
        }

        if (parameter.References) {
            await ReportingFormUtil.setInputComponent(field, parameter);
        } else if (Array.isArray(parameter.PossibleValues) && parameter.PossibleValues.length) {
            ReportingFormUtil.createDefaultValueInput(field, parameter);
        }

        if (allowPlaceholder) {
            field.options.push(new FormFieldOption(FormFieldOptions.ALLOW_PLACEHOLDER, true));
        }
    }

}
