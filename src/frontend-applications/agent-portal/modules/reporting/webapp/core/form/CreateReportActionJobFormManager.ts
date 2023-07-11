/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../../model/configuration/FormFieldOption';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ObjectReferenceOptions } from '../../../../base-components/webapp/core/ObjectReferenceOptions';
import { MacroAction } from '../../../../job/model/MacroAction';
import { MacroActionTypeOption } from '../../../../job/model/MacroActionTypeOption';
import { ExtendedJobFormManager } from '../../../../job/webapp/core/ExtendedJobFormManager';
import { ReportDefinition } from '../../../model/ReportDefinition';
import { ReportDefinitionProperty } from '../../../model/ReportDefinitionProperty';
import { ReportFormCreator } from './ReportFormCreator';
import { ReportObjectCreator } from './ReportObjectCreator';

export class CreateReportActionJobFormManager extends ExtendedJobFormManager {

    private subscriber: IEventSubscriber;

    public constructor() {
        super();

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('CreateReportActionJobFormManager'),
            eventPublished: (data: FormValuesChangedEventData, eventId: string): void => {
                const definitionValue = data.changedValues.find(
                    (cv) => cv[0] && cv[0].property === KIXObjectType.REPORT_DEFINITION
                );
                if (definitionValue && definitionValue[1]) {
                    const definitionId = definitionValue[1]?.value;

                    const parameterField = definitionValue[0]?.parent?.children?.find(
                        (p) => p.property === ReportDefinitionProperty.PARAMTER
                    );
                    this.handleParameterField(data.formInstance, parameterField, definitionId);

                    const outputFormatField = definitionValue[0]?.parent?.children?.find(
                        (p) => p.property === ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS
                    );
                    this.handleOutputFormatField(data.formInstance, outputFormatField, definitionId);
                }
            }
        };

        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.subscriber);
    }

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string, formInstance: FormInstance
    ): Promise<FormFieldConfiguration> {
        if (actionType === 'CreateReport') {
            if (option.Name === 'DefinitionID') {
                const field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'object-reference-input'
                );

                field.property = KIXObjectType.REPORT_DEFINITION;
                field.options = [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.REPORT_DEFINITION),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(ObjectReferenceOptions.FREETEXT, true)
                ];

                if (action) {
                    field.defaultValue = new FormFieldValue(action.Parameters['DefinitionID']);
                }

                return field;
            } else if (option.Name === 'Parameters') {
                const field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, null
                );
                field.property = ReportDefinitionProperty.PARAMTER;
                field.asStructure = true;
                field.required = false;
                field.defaultValue = new FormFieldValue(1);

                if (action) {
                    const definitionId = action.Parameters['DefinitionID'];
                    await this.handleParameterField(formInstance, field, definitionId, action.Parameters['Parameters']);
                }

                return field;
            } else if (option.Name === 'OutputFormats') {
                const field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, null
                );

                const outputfield = await ReportFormCreator.createOutputFormatField(null);
                field.inputComponent = outputfield.inputComponent;
                field.options = [...field.options, ...outputfield.options];
                field.defaultValue = outputfield.defaultValue;

                field.property = ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS;
                field.asStructure = true;

                if (action) {
                    const definitionId = action.Parameters['DefinitionID'];
                    await this.handleOutputFormatField(formInstance, field, definitionId, action.Parameters['OutputFormats']);
                }

                return field;
            }
        }
        return;
    }

    private async handleParameterField(
        formInstance: FormInstance, parameterField: FormFieldConfiguration,
        definitionId: number, defaultParameters?: any
    ): Promise<void> {
        // ignore variable/placeholder values (e.g. periodic job)
        if (definitionId && !isNaN(definitionId) && parameterField) {
            const reportDefinitions = await KIXObjectService.loadObjects<ReportDefinition>(
                KIXObjectType.REPORT_DEFINITION, [definitionId], null, null, true
            ).catch(() => []);

            if (Array.isArray(reportDefinitions) && reportDefinitions.length) {
                const fields = await ReportFormCreator.createParameterFields(
                    reportDefinitions[0], defaultParameters, true
                );
                formInstance?.addFieldChildren(parameterField, fields, true);
            }
        } else if (parameterField) {
            formInstance?.addFieldChildren(parameterField, [], true);
        }
    }

    private async handleOutputFormatField(
        formInstance: FormInstance, outputFormatField: FormFieldConfiguration, definitionId: number,
        outputFormat?: string
    ): Promise<void> {
        if (definitionId && outputFormatField) {
            let definition: ReportDefinition;
            if (!isNaN(definitionId)) {
                const reportDefinitions = await KIXObjectService.loadObjects<ReportDefinition>(
                    KIXObjectType.REPORT_DEFINITION, [definitionId], null, null, true
                ).catch(() => []);

                definition = reportDefinitions?.length ? reportDefinitions[0] : null;
            }

            const optionName = outputFormatField.options.find((o) => o.option === 'OptionName');
            const field = await ReportFormCreator.createOutputFormatField(definition, outputFormat);
            outputFormatField.options = field.options;

            if (optionName) {
                outputFormatField.options.push(optionName);
            }

            outputFormatField.defaultValue = field.defaultValue;
            outputFormatField.asStructure = false;

            await formInstance?.addFieldChildren(outputFormatField, []);
            EventService.getInstance().publish(
                FormEvent.RELOAD_INPUT_VALUES, { formInstance, formField: outputFormatField }
            );
        } else if (outputFormatField) {
            outputFormatField.asStructure = true;
            await formInstance?.addFieldChildren(outputFormatField, []);
        }
    }

    public async postPrepareOptionValue(
        actionType: string, optionName: string, value: any, parameter: any,
        field: FormFieldConfiguration, formInstance: FormInstance
    ): Promise<any> {
        if (optionName === 'DefinitionID') {
            if (Array.isArray(value)) {
                return value[0];
            }
        } else if (optionName === 'Parameters') {
            const definitionField = field?.parent?.children?.find(
                (f) => f.property === KIXObjectType.REPORT_DEFINITION
            );

            const definition = await this.getReportDefinition(definitionField, formInstance);
            if (definition) {
                const config = await ReportObjectCreator.getParameterConfig(field.children, formInstance, definition);
                return config;
            }
        }

        return;
    }

    private async getReportDefinition(
        field: FormFieldConfiguration, formInstance: FormInstance
    ): Promise<ReportDefinition> {
        const defintionValue = formInstance.getFormFieldValue<number>(field?.instanceId);
        const definitionId = defintionValue ? defintionValue.value : null;
        const definitions = await KIXObjectService.loadObjects<ReportDefinition>(
            KIXObjectType.REPORT_DEFINITION, [definitionId], null, null, true
        ).catch(() => []);

        return Array.isArray(definitions) && definitions.length ? definitions[0] : null;
    }

}