/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { FormFieldValueHandler } from '../../../../base-components/webapp/core/FormFieldValueHandler';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { ReportDefinitionProperty } from '../../../model/ReportDefinitionProperty';
import { ReportParameter } from '../../../model/ReportParamater';
import { ReportParameterProperty } from '../../../model/ReportParameterProperty';
import { ReportDefinitionFormCreator } from './ReportDefinitionFormCreator';
import { ReportingFormUtil } from './ReportingFormUtil';

export class ReportDefinitionFormValueHandler extends FormFieldValueHandler {

    public objectType: string = KIXObjectType.REPORT_DEFINITION;

    public id: string = 'ReportDataSourceFormValueHandler';

    private timeout;

    public constructor() {
        super();

        EventService.getInstance().subscribe(FormEvent.FIELD_DUPLICATED, {
            eventSubscriberId: 'ReportDefinitionFormValueHandler',
            eventPublished: async (data: any, eventId: string): Promise<void> => {
                const field: FormFieldConfiguration = data ? data.field : null;
                if (field && field.property === ReportDefinitionProperty.PARAMTER) {
                    const formInstance: FormInstance = data.formInstance;
                    const instanceIds = [];
                    field.children.forEach((f) => instanceIds.push(f.instanceId));
                    const values: Array<[string, any]> = instanceIds.map((i) => [i, null]);
                    await formInstance.provideFormFieldValues(values, null);
                }
            }
        });

    }
    public async handleFormFieldValues(
        formInstance: FormInstance, changedFieldValues: Array<[FormFieldConfiguration, FormFieldValue]>
    ): Promise<void> {
        if (this.timeout) {
            window.clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(async () => {
            const datasourceValue = changedFieldValues.find(
                (cv) => cv[0] && cv[0].property === ReportDefinitionProperty.DATASOURCE
            );
            if (datasourceValue && datasourceValue[1].value) {
                await ReportDefinitionFormCreator.updateDataSourceField(formInstance, datasourceValue[0]);
            }

            const outputFormatValue = changedFieldValues.find(
                (cv) => cv[0] && cv[0].property === ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS
            );
            if (outputFormatValue) {
                await ReportDefinitionFormCreator.updateOutputFormatField(formInstance, outputFormatValue[0]);
            }

            const referencesValue = changedFieldValues.find(
                (cv) => cv[0] && cv[0].property === ReportParameterProperty.REFERENCES
            );
            if (referencesValue && referencesValue[1]) {
                await this.adjustPossibleValuesField(referencesValue[0], referencesValue[1], formInstance);
            }

            const possibleValuesValue = changedFieldValues.find(
                (cv) => cv[0] && cv[0].property === ReportParameterProperty.POSSIBLE_VALUES
            );
            if (possibleValuesValue && possibleValuesValue[1]) {
                await this.adjustDefaultField(possibleValuesValue[0], possibleValuesValue[1], formInstance);
            }

            const multipleValue = changedFieldValues.find(
                (cv) => cv[0] && cv[0].property === ReportParameterProperty.MULTIPLE
            );
            if (multipleValue && multipleValue[1]) {
                await this.adjustDefaultField(multipleValue[0], multipleValue[1], formInstance);
            }

            this.timeout = null;
        }, 750);
    }

    private async adjustPossibleValuesField(
        field: FormFieldConfiguration, value: FormFieldValue<string>, formInstance: FormInstance
    ): Promise<void> {
        let possibleValuesField = field.parent.children.find(
            (f) => f.property === ReportParameterProperty.POSSIBLE_VALUES
        );
        possibleValuesField = formInstance.getFormField(possibleValuesField?.instanceId);

        if (possibleValuesField) {
            const parameter = new ReportParameter();
            parameter.References = value.value;
            parameter.Multiple = 1;

            await ReportingFormUtil.setInputComponent(possibleValuesField, parameter, false, true);

            setTimeout(async () => {
                // reset also default field
                const defaultField = field.parent.children.find((f) => f.property === ReportParameterProperty.DEFAULT);
                if (defaultField) {
                    defaultField.options = [];
                    await formInstance.provideFormFieldValues([[defaultField.instanceId, null]], null);
                    EventService.getInstance().publish(
                        FormEvent.RELOAD_INPUT_VALUES, { formInstance, formField: defaultField }
                    );
                }

                if (possibleValuesField) {
                    await formInstance.provideFormFieldValues([[possibleValuesField.instanceId, null]], null);
                    EventService.getInstance().publish(
                        FormEvent.RELOAD_INPUT_VALUES, { formInstance, formField: possibleValuesField }
                    );
                }
            }, 20);
        }
    }

    private async adjustDefaultField(
        field: FormFieldConfiguration, value: FormFieldValue<string>, formInstance: FormInstance, keepValue?: boolean
    ): Promise<void> {
        let defaultField = field.parent.children.find((f) => f.property === ReportParameterProperty.DEFAULT);
        defaultField = formInstance.getFormField(defaultField?.instanceId);
        if (defaultField) {
            const multipleField = field.parent.children.find((f) => f.property === ReportParameterProperty.MULTIPLE);
            const multipleValue = formInstance.getFormFieldValue(multipleField?.instanceId);

            const referencesField = field.parent.children.find(
                (f) => f.property === ReportParameterProperty.REFERENCES
            );
            const referencesValue = formInstance.getFormFieldValue<string>(referencesField?.instanceId);

            const parameter = new ReportParameter();
            parameter.References = referencesValue ? referencesValue.value : null;
            parameter.Multiple = multipleValue
                ? (multipleValue.value ? 1 : 0)
                : 0;

            const possibleValueField = field.parent.children.find(
                (f) => f.property === ReportParameterProperty.POSSIBLE_VALUES
            );
            const possibleValues = formInstance.getFormFieldValue<string>(possibleValueField?.instanceId);
            if (possibleValues) {
                if (Array.isArray(possibleValues.value)) {
                    parameter.PossibleValues = possibleValues.value;
                } else if (typeof possibleValues.value === 'string' && possibleValues.value.indexOf(',') !== -1) {
                    parameter.PossibleValues = possibleValues.value.split(',');
                }
            }

            const existingValue = formInstance.getFormFieldValue<any[]>(defaultField.instanceId);

            // only use possible values
            if (parameter.PossibleValues) {
                if (Array.isArray(existingValue?.value)) {
                    existingValue.value = existingValue.value.filter(
                        (v) => parameter.PossibleValues.some((pv) => pv === v)
                    );
                } else if (
                    existingValue?.value && !parameter.PossibleValues.some((pv) => pv === existingValue?.value)
                ) {
                    existingValue.value = null;
                }
            }

            // reduce if necessary
            if (!parameter.Multiple && Array.isArray(existingValue?.value) && existingValue.value.length > 1) {
                existingValue.value = [existingValue.value[0]];
            }

            await ReportingFormUtil.setInputComponent(defaultField, parameter);
            setTimeout(async () => {
                await formInstance.provideFormFieldValues([[defaultField.instanceId, existingValue?.value]], null);

                EventService.getInstance().publish(
                    FormEvent.RELOAD_INPUT_VALUES, { formInstance, formField: defaultField }
                );
            }, 50);
        }
    }
}
