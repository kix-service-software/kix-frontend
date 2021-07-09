/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { report } from 'process';
import { DefaultSelectInputFormOption } from '../../../../../model/configuration/DefaultSelectInputFormOption';
import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../../model/configuration/FormFieldOption';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../../../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../../../../model/configuration/FormPageConfiguration';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ObjectReferenceOptions } from '../../../../base-components/webapp/core/ObjectReferenceOptions';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { Role } from '../../../../user/model/Role';
import { RoleProperty } from '../../../../user/model/RoleProperty';
import { DataSource } from '../../../model/DataSource';
import { ReportDataSourceOption } from '../../../model/ReportDatasourceOption';
import { ReportDefinition } from '../../../model/ReportDefinition';
import { ReportDefinitionProperty } from '../../../model/ReportDefinitionProperty';
import { ReportOutputFormat } from '../../../model/ReportOutputFormat';
import { ReportParameter } from '../../../model/ReportParamater';
import { ReportParameterProperty } from '../../../model/ReportParameterProperty';
import { ReportingFormUtil } from './ReportingFormUtil';

export class ReportDefinitionFormCreator {

    public static async createFormPages(
        form: FormConfiguration, reportDefinition: ReportDefinition, formInstance: FormInstance
    ): Promise<void> {
        const commonPage = await this.createCommonPage(reportDefinition);
        const dataSourcePage = await this.createDataSourcePage(reportDefinition, formInstance);
        const outputFormatsPage = await this.createOutputFormatsPage(reportDefinition, formInstance);

        form.pages = [commonPage, dataSourcePage, outputFormatsPage];
    }

    private static async createCommonPage(reportDefinition: ReportDefinition): Promise<FormPageConfiguration> {
        const titleField = new FormFieldConfiguration(
            'report-common-title', 'Translatable#Title', ReportDefinitionProperty.NAME, null, true,
            'Translatable#Helptext_Reporting_ReportCreate_Title', [],
            new FormFieldValue(reportDefinition?.Name)
        );
        titleField.instanceId = IdService.generateDateBasedId();

        const commentField = new FormFieldConfiguration(
            'report-common-comment', 'Translatable#Comment', ReportDefinitionProperty.COMMENT, 'text-area-input', false,
            'Translatable#Helptext_Reporting_ReportCreate_Comment', [],
            new FormFieldValue(reportDefinition?.Comment)
        );
        commentField.instanceId = IdService.generateDateBasedId();

        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(RoleProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'Report User')
        ]);

        let defaultValue: FormFieldValue;
        if (!reportDefinition) {
            const roles = await KIXObjectService.loadObjects<Role>(KIXObjectType.ROLE, null, loadingOptions);
            defaultValue = Array.isArray(roles) && roles.length ? new FormFieldValue([roles[0].ID]) : null;
        }
        const roleField = new FormFieldConfiguration(
            'report-common-roles',
            'Translatable#Roles', ReportDefinitionProperty.ROLE_IDS, 'object-reference-input', true,
            'Translatable#Helptext_Reporting_ReportCreate_Roles',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.ROLE),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
            ],
            defaultValue
        );
        roleField.instanceId = IdService.generateDateBasedId();

        const validField = new FormFieldConfiguration(
            'report-common-valid',
            'Translatable#Validity', KIXObjectProperty.VALID_ID, 'object-reference-input', true,
            'Translatable#Helptext_Reporting_ReportCreate_Validity',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false)
            ],
            new FormFieldValue(reportDefinition ? reportDefinition.ValidID : 1)
        );
        validField.instanceId = IdService.generateDateBasedId();

        const group = new FormGroupConfiguration(
            'report-common-group', 'Report Common Group', [], null,
            [titleField, commentField, roleField, validField]
        );

        return new FormPageConfiguration(
            'report-common-page', 'Translatable#Report Information', [], true, false, [group]
        );
    }

    private static async createDataSourcePage(
        reportDefinition: ReportDefinition, formInstance: FormInstance
    ): Promise<FormPageConfiguration> {
        const dataSource = reportDefinition ? reportDefinition.DataSource : 'GenericSQL';
        const dataSourceField = this.createDataSourceField(dataSource);
        const outputHandlerField = ReportDefinitionFormCreator.createOutputHandlerFields(reportDefinition);
        const optionFields = await ReportDefinitionFormCreator.createDataSourceOptionFields(
            reportDefinition, dataSource, formInstance
        );
        dataSourceField.children = optionFields;

        const parameterFields = await this.createDataSourceParameterFields(reportDefinition, formInstance);
        const dsGroup = new FormGroupConfiguration(
            'report-datasource-group', '', [], null, [dataSourceField]
        );
        const outputHandlerGroup = new FormGroupConfiguration(
            'report-datasource-outputhandler-group', '', [], null, [outputHandlerField]
        );

        const parameterGroup = new FormGroupConfiguration(
            'report-datasource-parameter-group', '', [], null, parameterFields
        );

        const optionFieldValues: Array<[string, any]> = optionFields.map((f) => [f.instanceId, f.defaultValue.value]);
        await formInstance.provideFormFieldValues([
            [dataSourceField.instanceId, dataSourceField.defaultValue.value],
            [outputHandlerField.instanceId, outputHandlerField.defaultValue.value],
            ...optionFieldValues
        ], null);

        return new FormPageConfiguration(
            'report-datasource-page', 'Translatable#Datasource', [], true, false,
            [dsGroup, outputHandlerGroup, parameterGroup]
        );
    }

    private static createOutputHandlerFields(reportDefinition: ReportDefinition): FormFieldConfiguration {
        const dsConfig = reportDefinition?.Config && reportDefinition?.Config['DataSource'];
        const outputHandler = dsConfig && dsConfig['OutputHandler']
            ? BrowserUtil.formatJSON(dsConfig['OutputHandler'])
            : null;

        const outputhandlerField = new FormFieldConfiguration(
            'report-datasource-sourceoutputhandler', 'Translatable#Output Handler', 'OutputHandler', 'text-area-input',
            false, 'Translatable#Helptext_Reporting_ReportCreate_Datasource_OutputHandler',
            [
                new FormFieldOption(FormFieldOptions.LANGUAGE, 'perl')
            ],
            new FormFieldValue(outputHandler)
        );
        outputhandlerField.readonly = true;
        outputhandlerField.instanceId = IdService.generateDateBasedId();

        return outputhandlerField;
    }

    private static createDataSourceField(dataSource?: string): FormFieldConfiguration {
        const dataSourceField = new FormFieldConfiguration(
            'report-datasource-source', 'Translatable#Datasource', ReportDefinitionProperty.DATASOURCE, 'object-reference-input',
            true, 'Translatable#Helptext_Reporting_ReportCreate_Datasource',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.REPORT_DATA_SOURCE),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false)
            ],
            new FormFieldValue(dataSource)
        );
        dataSourceField.instanceId = IdService.generateDateBasedId();
        return dataSourceField;
    }

    public static async createDataSourceOptionFields(
        reportDefinition: ReportDefinition, dataSource: string, formInstance: FormInstance
    ): Promise<FormFieldConfiguration[]> {
        const datasources = await KIXObjectService.loadObjects<DataSource>(
            KIXObjectType.REPORT_DATA_SOURCE, [dataSource]
        ).catch(() => []);

        const optionFields = [];
        if (Array.isArray(datasources) && datasources.length && datasources[0].Options) {
            const options = datasources[0].Options;
            for (const option in options) {
                if (options[option]) {
                    const parameter: ReportDataSourceOption = options[option];

                    // TODO: here we need an extension mechanism to handle datasource specific parameter
                    if (parameter.Name === 'SQL') {
                        if (reportDefinition) {
                            const sqlConfig = reportDefinition.Config['DataSource']['SQL'];
                            for (const dbms in sqlConfig) {
                                if (sqlConfig[dbms]) {
                                    const dbmsField = await this.createDBMSField(
                                        dbms, parameter, formInstance, sqlConfig[dbms]
                                    );
                                    optionFields.push(dbmsField);
                                }
                            }
                        } else {
                            const dbmsField = await this.createDBMSField('any', parameter, formInstance);
                            optionFields.push(dbmsField);
                        }
                    }
                }
            }
        }
        return optionFields;
    }

    private static async createDBMSField(
        dbms: string, parameter: ReportDataSourceOption, formInstance: FormInstance, sqlValue?: string
    ): Promise<FormFieldConfiguration> {
        const sqlField = this.createSQLField(parameter, sqlValue);

        await formInstance.provideFormFieldValues([[sqlField.instanceId, sqlField.defaultValue?.value]], null);

        const dbmsField = new FormFieldConfiguration(
            'DBMS', 'Translatable#DBMS', 'DBMS', 'default-select-input',
            true, 'Translatable#Helptext_Reporting_ReportCreate_Datasource_DBMS',
            [
                new FormFieldOption(DefaultSelectInputFormOption.NODES,
                    [
                        new TreeNode('postgresql', 'Postgres'),
                        new TreeNode('mysql', 'MySQL'),
                        new TreeNode('any', 'Any'),
                    ]),
                new FormFieldOption(DefaultSelectInputFormOption.MULTI, false)
            ],
            new FormFieldValue(dbms),
            null,
            [sqlField],
            null, null, null, null, null, null, null, null, null,
            true
        );
        dbmsField.instanceId = IdService.generateDateBasedId();
        return dbmsField;
    }

    private static createSQLField(
        parameter: ReportDataSourceOption, value?: string
    ): FormFieldConfiguration {
        if (value) {
            const match = value.match(/base64\((.*)\)/);
            if (match && match.length === 2) {
                value = Buffer.from(match[1], 'base64').toString();
            }
        }

        const sqlField = new FormFieldConfiguration(
            parameter.Name, parameter.Label, parameter.Name, 'text-area-input',
            Boolean(parameter.Required), parameter.Description,
            [
                new FormFieldOption(FormFieldOptions.LANGUAGE, 'sql')
            ],
            new FormFieldValue(value)
        );
        sqlField.instanceId = IdService.generateDateBasedId();
        return sqlField;
    }

    private static async createDataSourceParameterFields(
        reportDefinition: ReportDefinition, formInstance: FormInstance
    ): Promise<FormFieldConfiguration[]> {
        const fields = [];
        if (reportDefinition && Array.isArray(reportDefinition.Config['Parameters'])) {
            const parameters: ReportParameter[] = reportDefinition.Config['Parameters'];
            for (const parameter of parameters) {
                const field = await this.createParameterField(parameter, formInstance);
                fields.push(field);
            }
        } else {
            const field = await this.createParameterField(null, formInstance);
            fields.push(field);
        }

        return fields;
    }

    private static async createParameterField(
        parameter: ReportParameter, formInstance: FormInstance
    ): Promise<FormFieldConfiguration> {
        const parameterField = new FormFieldConfiguration(
            'report-parameter', 'Translatable#Parameter', ReportDefinitionProperty.PARAMTER, null,
            false, 'Translatable#Helptext_Reporting_ReportCreate_Parameter', []
        );
        parameterField.countMax = 50;
        parameterField.countMin = 0;
        parameterField.countDefault = 0;
        parameterField.instanceId = IdService.generateDateBasedId();
        parameterField.empty = true;
        parameterField.asStructure = true;

        if (parameter) {
            parameterField.empty = false;
            await this.createParameterFields(parameterField, parameter, formInstance);
        }
        return parameterField;
    }

    public static async createParameterFields(
        parameterField: FormFieldConfiguration, parameter: ReportParameter, formInstance: FormInstance
    ): Promise<void> {
        const nameField = new FormFieldConfiguration(
            'report-parameter-name', 'Translatable#Name', ReportParameterProperty.NAME, null,
            true, 'Translatable#Helptext_Reporting_ReportCreate_ParameterName', []
        );
        nameField.instanceId = IdService.generateDateBasedId();
        nameField.defaultValue = parameter ? new FormFieldValue(parameter.Name) : null;
        nameField.parent = parameterField;
        nameField.parentInstanceId = parameterField.instanceId;
        parameterField.children.push(nameField);

        const labelField = new FormFieldConfiguration(
            'report-parameter-label', 'Translatable#Label', ReportParameterProperty.LABEL, null,
            false, 'Translatable#Helptext_Reporting_ReportCreate_ParameterLabel', []
        );
        labelField.instanceId = IdService.generateDateBasedId();
        labelField.defaultValue = parameter ? new FormFieldValue(parameter.Label) : null;
        labelField.parent = parameterField;
        labelField.parentInstanceId = parameterField.instanceId;
        parameterField.children.push(labelField);

        const descriptionField = new FormFieldConfiguration(
            'report-parameter-description', 'Translatable#Description', ReportParameterProperty.DESCRIPTION, null,
            false, 'Translatable#Helptext_Reporting_ReportCreate_ParameterDescription', []
        );
        descriptionField.instanceId = IdService.generateDateBasedId();
        descriptionField.defaultValue = parameter ? new FormFieldValue(parameter.Description) : null;
        descriptionField.parent = parameterField;
        descriptionField.parentInstanceId = parameterField.instanceId;
        parameterField.children.push(descriptionField);

        const dataTypeField = new FormFieldConfiguration(
            'report-parameter-datatype', 'Translatable#Data Type', ReportParameterProperty.DATA_TYPE, 'default-select-input',
            true, 'Translatable#Helptext_Reporting_ReportCreate_ParameterDataType',
            [
                new FormFieldOption(DefaultSelectInputFormOption.NODES,
                    [
                        new TreeNode('STRING', 'String'),
                        new TreeNode('NUMERIC', 'Numeric'),
                        new TreeNode('DATE', 'Date'),
                        new TreeNode('DATETIME', 'Date Time'),
                        new TreeNode('TIME', 'Time')
                    ]),
                new FormFieldOption(DefaultSelectInputFormOption.MULTI, false),
                new FormFieldOption(DefaultSelectInputFormOption.TRANSLATABLE, false)
            ],
        );
        dataTypeField.instanceId = IdService.generateDateBasedId();
        dataTypeField.defaultValue = parameter ? new FormFieldValue(parameter.DataType) : new FormFieldValue('string');
        dataTypeField.parent = parameterField;
        dataTypeField.parentInstanceId = parameterField.instanceId;
        parameterField.children.push(dataTypeField);

        const requiredField = new FormFieldConfiguration(
            'report-parameter-required', 'Translatable#Required', ReportParameterProperty.REQUIRED, 'checkbox-input',
            false, 'Translatable#Helptext_Reporting_ReportCreate_ParameterRequired', []
        );
        requiredField.instanceId = IdService.generateDateBasedId();
        requiredField.defaultValue = parameter ? new FormFieldValue(Boolean(parameter.Required)) : null;
        requiredField.parent = parameterField;
        requiredField.parentInstanceId = parameterField.instanceId;
        parameterField.children.push(requiredField);

        const multipleField = new FormFieldConfiguration(
            'report-parameter-multiple', 'Translatable#Multiple', ReportParameterProperty.MULTIPLE, 'checkbox-input',
            false, 'Translatable#Helptext_Reporting_ReportCreate_ParameterMultiple', []
        );
        multipleField.instanceId = IdService.generateDateBasedId();
        multipleField.defaultValue = parameter ? new FormFieldValue(Boolean(parameter.Multiple)) : null;
        multipleField.parent = parameterField;
        multipleField.parentInstanceId = parameterField.instanceId;
        parameterField.children.push(multipleField);

        const readonlyField = new FormFieldConfiguration(
            'report-parameter-readonly', 'Translatable#Readonly', ReportParameterProperty.READ_ONLY, 'checkbox-input',
            false, 'Translatable#Helptext_Reporting_ReportCreate_ParameterReadonly', []
        );
        readonlyField.instanceId = IdService.generateDateBasedId();
        readonlyField.defaultValue = parameter ? new FormFieldValue(Boolean(parameter.ReadOnly)) : null;
        readonlyField.parent = parameterField;
        readonlyField.parentInstanceId = parameterField.instanceId;
        parameterField.children.push(readonlyField);

        const referencesField = new FormFieldConfiguration(
            'report-parameter-references', 'Translatable#References', ReportParameterProperty.REFERENCES, null,
            false, 'Translatable#Helptext_Reporting_ReportCreate_ParameterReferences',
            // [
            //     new FormFieldOption(DefaultSelectInputFormOption.NODES, this.getReferenceNodes()),
            //     new FormFieldOption(ObjectReferenceOptions.FREETEXT, true)
            // ]
        );
        referencesField.instanceId = IdService.generateDateBasedId();
        referencesField.defaultValue = parameter ? new FormFieldValue(parameter.References) : null;
        referencesField.parent = parameterField;
        referencesField.parentInstanceId = parameterField.instanceId;
        parameterField.children.push(referencesField);

        const possibleValuesField = new FormFieldConfiguration(
            'report-parameter-posiible-values', 'Translatable#Possible Values',
            ReportParameterProperty.POSSIBLE_VALUES,
            null, false, 'Translatable#Helptext_Reporting_ReportCreate_ParameterPossibleValues', []
        );
        possibleValuesField.instanceId = IdService.generateDateBasedId();
        possibleValuesField.defaultValue = parameter ? new FormFieldValue(parameter.PossibleValues) : null;
        possibleValuesField.parent = parameterField;
        possibleValuesField.parentInstanceId = parameterField.instanceId;
        ReportingFormUtil.setInputComponent(possibleValuesField, parameter, false, true);
        parameterField.children.push(possibleValuesField);

        const defaultField = new FormFieldConfiguration(
            'report-parameter-default', 'Translatable#Default', ReportParameterProperty.DEFAULT, null,
            false, 'Translatable#Helptext_Reporting_ReportCreate_ParameterDefault', []
        );
        defaultField.instanceId = IdService.generateDateBasedId();
        defaultField.defaultValue = parameter ? new FormFieldValue(parameter.Default) : null;
        defaultField.parent = parameterField;
        defaultField.parentInstanceId = parameterField.instanceId;
        ReportingFormUtil.setInputComponent(defaultField, parameter);
        parameterField.children.push(defaultField);

        await formInstance.provideFormFieldValues([
            [nameField.instanceId, nameField.defaultValue?.value],
            [labelField.instanceId, labelField.defaultValue?.value],
            [descriptionField.instanceId, descriptionField.defaultValue?.value],
            [dataTypeField.instanceId, dataTypeField.defaultValue?.value],
            [requiredField.instanceId, requiredField.defaultValue?.value],
            [multipleField.instanceId, multipleField.defaultValue?.value],
            [readonlyField.instanceId, readonlyField.defaultValue?.value],
            [referencesField.instanceId, referencesField.defaultValue?.value],
            [possibleValuesField.instanceId, possibleValuesField.defaultValue?.value],
            [defaultField.instanceId, defaultField.defaultValue?.value]
        ], null);
    }

    private static getReferenceNodes(): TreeNode[] {
        return [
            new TreeNode('Ticket.ID', 'Ticket.ID'),
            new TreeNode('Ticket.Title', 'Ticket.Title'),
            new TreeNode('TicketType.Name', 'TicketType.Name'),
            new TreeNode('TicketType.ID', 'TicketType.ID'),
            new TreeNode('Queue.QueueID', 'Queue.QueueID'),
            new TreeNode('Queue.Name', 'Queue.Name'),
        ];
    }

    private static async createOutputFormatsPage(
        reportDefinition: ReportDefinition, formInstance: FormInstance
    ): Promise<FormPageConfiguration> {
        const titleField = new FormFieldConfiguration(
            'report-ouputformats-title', 'Translatable#Title', ReportDefinitionProperty.CONFIG_TITLE, null, false,
            'Translatable#Helptext_Reporting_ReportDefinitionCreate_Title'
        );
        titleField.instanceId = IdService.generateDateBasedId();
        titleField.defaultValue = reportDefinition && reportDefinition.Config[ReportDefinitionProperty.CONFIG_TITLE]
            ? new FormFieldValue(reportDefinition.Config[ReportDefinitionProperty.CONFIG_TITLE])
            : null;

        const outputFormatFields = await this.createOutputFormatFields(reportDefinition, formInstance);

        const group = new FormGroupConfiguration(
            'report-outputformats-group', 'Report Output Format Group', [], null, [titleField, ...outputFormatFields]
        );

        await formInstance.provideFormFieldValues([
            [titleField.instanceId, titleField.defaultValue?.value],
        ], null);

        return new FormPageConfiguration(
            'report-outputformats-page', 'Translatable#Output Format', [], true, false, [group]
        );
    }

    public static async createOutputFormatFields(
        reportDefinition: ReportDefinition, formInstance: FormInstance
    ): Promise<FormFieldConfiguration[]> {
        const outputFormatFields = [];

        if (reportDefinition) {
            const values: Array<[string, any]> = [];
            const outputFormats = reportDefinition.Config['OutputFormats'];
            for (const format in outputFormats) {
                if (!outputFormats[format]) {
                    continue;
                }

                const outputFormat = outputFormats[format];
                const outputFormatField = this.createOutputFormatField(format);
                const fields = await this.createOutputFormatOptionsFields(format, outputFormat);
                outputFormatField.children = fields;
                outputFormatFields.push(outputFormatField);

                values.push([outputFormatField.instanceId, outputFormatField.defaultValue.value]);
                fields.forEach((f) => values.push([f.instanceId, f.defaultValue.value]));
            }

            await formInstance.provideFormFieldValues(values, null);
        }

        if (!outputFormatFields.length) {
            outputFormatFields.push(this.createOutputFormatField());
        }

        return outputFormatFields;
    }

    private static createOutputFormatField(value?: string): FormFieldConfiguration {
        const outputFormatField = new FormFieldConfiguration(
            'report-outputformats-outputformat', 'Translatable#Output Format',
            ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS,
            'object-reference-input', false,
            'Translatable#Helptext_Reporting_ReportCreate_OutputFormat',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.REPORT_OUTPUT_FORMAT),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                new FormFieldOption(ObjectReferenceOptions.KEEP_SELECTION, true)
            ], new FormFieldValue(value), [], [], null, 1, 20, 1
        );
        outputFormatField.instanceId = IdService.generateDateBasedId();
        return outputFormatField;
    }

    private static async createOutputFormatOptionsFields(
        format: string, outputFormatOptions: any
    ): Promise<FormFieldConfiguration[]> {
        const formatResult = await KIXObjectService.loadObjects<ReportOutputFormat>(
            KIXObjectType.REPORT_OUTPUT_FORMAT, [format]
        ).catch(() => []);

        const fields: FormFieldConfiguration[] = [];
        if (Array.isArray(formatResult) && formatResult.length && formatResult[0].Options) {
            const options = formatResult[0].Options;
            for (const option in options) {
                if (options[option]) {
                    const parameter: ReportDataSourceOption = options[option];

                    // TODO: here we need an extension mechanism to handle datasource specific parameter
                    let field: FormFieldConfiguration;
                    if (parameter.Name === 'IncludeColumnHeader') {
                        field = new FormFieldConfiguration(
                            parameter.Name, parameter.Label, parameter.Name, 'checkbox-input',
                            Boolean(parameter.Required), parameter.Description
                        );
                    } else {
                        field = new FormFieldConfiguration(
                            parameter.Name, parameter.Label, parameter.Name, null,
                            Boolean(parameter.Required), parameter.Description
                        );
                    }

                    field.defaultValue = outputFormatOptions && outputFormatOptions[parameter.Name]
                        ? new FormFieldValue(outputFormatOptions[parameter.Name])
                        : this.getOutputFormatParameterDefaultValue(parameter);

                    if (parameter.Name === 'Columns') {
                        field.defaultValue = outputFormatOptions && outputFormatOptions[parameter.Name]
                            ? new FormFieldValue(outputFormatOptions && outputFormatOptions[parameter.Name].join(','))
                            : new FormFieldValue(null);
                    }

                    field.instanceId = IdService.generateDateBasedId();
                    fields.push(field);
                }
            }
        }
        return fields;
    }

    private static getOutputFormatParameterDefaultValue(parameter: ReportDataSourceOption): FormFieldValue {
        let value: any;

        if (parameter.Name === 'Quote') {
            value = '"';
        } else if (parameter.Name === 'Separator') {
            value = ',';
        } else if (parameter.Name === 'IncludeColumnHeader') {
            value = true;
        }

        return new FormFieldValue(value);

    }

    public static async updateDataSourceField(
        formInstance: FormInstance, field: FormFieldConfiguration
    ): Promise<void> {
        const value = formInstance.getFormFieldValue<string>(field.instanceId);
        if (value) {
            const options = await this.createDataSourceOptionFields(null, value.value, formInstance);
            formInstance.addFieldChildren(field, options, true);
        } else {
            formInstance.addFieldChildren(field, [], true);
        }
    }

    public static async updateOutputFormatField(
        formInstance: FormInstance, field: FormFieldConfiguration
    ): Promise<void> {
        const value = formInstance.getFormFieldValue<string>(field.instanceId);
        if (value && value.value) {
            const options = await this.createOutputFormatOptionsFields(value.value, null);
            formInstance.addFieldChildren(field, options, true);
        } else {
            formInstance.addFieldChildren(field, [], true);
        }

        const existingValues = [];
        const outputFields = formInstance.getFormFieldsByProperty(ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS);

        for (const of of outputFields) {
            const ofValue = formInstance.getFormFieldValue(of.instanceId);
            if (ofValue && ofValue.value) {
                existingValues.push(ofValue.value);
            }
        }

        const outputFormats = await KIXObjectService.loadObjects<ReportOutputFormat>(
            KIXObjectType.REPORT_OUTPUT_FORMAT
        );

        const selectableOutputFormats = outputFormats
            .filter((of) => !existingValues.some((ev) => of.Name === ev))
            .map((of) => of.Name);

        for (const of of outputFields) {

            const fieldValue = formInstance.getFormFieldValue(of.instanceId);
            const values = fieldValue && fieldValue.value
                ? [fieldValue.value, ...selectableOutputFormats]
                : selectableOutputFormats;

            const option = of.options.find((o) => o.option === ObjectReferenceOptions.OBJECT_IDS);
            if (option) {
                option.value = values;
            } else {
                of.options.push(new FormFieldOption(ObjectReferenceOptions.OBJECT_IDS, values));
            }

            EventService.getInstance().publish(
                FormEvent.RELOAD_INPUT_VALUES, { formInstance, formField: of }
            );
        }
    }
}
