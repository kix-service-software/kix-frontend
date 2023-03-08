/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DefaultSelectInputFormOption } from '../../../../../model/configuration/DefaultSelectInputFormOption';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../../model/configuration/FormFieldOption';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { DynamicFieldFormUtil } from '../../../../base-components/webapp/core/DynamicFieldFormUtil';
import { ObjectReferenceOptions } from '../../../../base-components/webapp/core/ObjectReferenceOptions';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { DynamicFormFieldOption } from '../../../../dynamic-fields/webapp/core';
import { ReportParameter } from '../../../model/ReportParamater';
import { ReportParameterProperty } from '../../../model/ReportParameterProperty';

export class ReportingFormUtil {

    /**
     *
     * @param field
     * @param references References schould be a string with object and property,
     * e.g. 'Ticket.ID', 'TicketType.ID', 'DynamicField.<NAME>'
     */
    public static async setInputComponent(
        field: FormFieldConfiguration, parameter: ReportParameter, filterPossibleValues: boolean = true,
        multiple?: boolean, objectType: KIXObjectType = KIXObjectType.REPORT_DEFINITION
    ): Promise<void> {
        if (!field) {
            return;
        }

        field.options = [];

        if (parameter && parameter.References) {
            const parts = parameter.References.split('.');
            if (parts.length >= 2) {
                const object = parts[0];

                if (object === 'DynamicField') {
                    await this.prepareDynamicFieldInput(
                        field, parts[1], typeof multiple === 'boolean' ? multiple : Boolean(parameter.Multiple),
                        parameter.PossibleValues, objectType, filterPossibleValues
                    );
                } else {

                    field.options = [];
                    field.inputComponent = 'object-reference-input';
                    field.options.push(new FormFieldOption(ObjectReferenceOptions.OBJECT, object));
                    field.options.push(new FormFieldOption(
                        ObjectReferenceOptions.MULTISELECT,
                        typeof multiple === 'boolean' ? multiple : Boolean(parameter.Multiple))
                    );
                    field.options.push(new FormFieldOption(FormFieldOptions.SHOW_INVALID, false));

                    if (filterPossibleValues) {
                        field.options.push(
                            new FormFieldOption(ObjectReferenceOptions.OBJECT_IDS, parameter.PossibleValues)
                        );
                    }
                }

                field.required = false;
            }
        }

        if (field.property === ReportParameterProperty.POSSIBLE_VALUES) {
            this.createPossibleValueInput(field, parameter);
        }
    }

    public static createPossibleValueInput(
        field: FormFieldConfiguration, parameter: ReportParameter
    ): void {
        if (parameter && Array.isArray(parameter.PossibleValues) && parameter.PossibleValues.length) {
            field.defaultValue = new FormFieldValue(parameter.PossibleValues);
        }
    }

    public static createDefaultValueInput(
        field: FormFieldConfiguration, parameter: ReportParameter
    ): void {
        if (parameter && Array.isArray(parameter.PossibleValues) && parameter.PossibleValues.length) {
            const nodes = parameter.PossibleValues.map((v) => new TreeNode(v, v));
            field.inputComponent = 'default-select-input';
            field.options = [
                new FormFieldOption(DefaultSelectInputFormOption.NODES, nodes),
                new FormFieldOption(DefaultSelectInputFormOption.MULTI, Boolean(parameter.Multiple)),
            ];
        } else {

            field.inputComponent = null;
        }
    }

    private static async prepareDynamicFieldInput(
        field: FormFieldConfiguration, dfName: string, multiple: boolean, possibleValues?: string[] | number[],
        objectType: KIXObjectType = KIXObjectType.REPORT_DEFINITION, filterPossibleValues?: boolean
    ): Promise<void> {
        field.options.push(new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, dfName));
        await DynamicFieldFormUtil.getInstance().createDynamicFormField(field);
        if (field.inputComponent === 'object-reference-input') {
            const countMaxOptionIndex = field.options.findIndex((o) => o.option === ObjectReferenceOptions.COUNT_MAX);
            if (countMaxOptionIndex !== -1) {
                field.options[countMaxOptionIndex].value = -1;
            }
            const multiSelectIndex = field.options.findIndex((o) => o.option === ObjectReferenceOptions.MULTISELECT);
            if (multiSelectIndex !== -1) {
                field.options[multiSelectIndex].value = multiple;
            }
            const showInvalidIndex = field.options.findIndex((o) => o.option === FormFieldOptions.SHOW_INVALID);
            if (showInvalidIndex !== -1) {
                field.options.splice(showInvalidIndex, 1);
            }
            field.options.push(new FormFieldOption(FormFieldOptions.SHOW_INVALID, false));

            if (possibleValues) {
                if (objectType === KIXObjectType.REPORT) {
                    const nodesIndex = field.options.findIndex(
                        (o) => o.option === ObjectReferenceOptions.ADDITIONAL_NODES
                    );
                    if (nodesIndex !== -1 && Array.isArray(field.options[nodesIndex].value)) {
                        const nodes = field.options[nodesIndex].value as TreeNode[];
                        field.options[nodesIndex].value = nodes.filter(
                            (n) => possibleValues.some((pv) => pv?.toString() === n.id?.toString())
                        );
                    }
                }

                if (filterPossibleValues) {
                    field.options.push(
                        new FormFieldOption(ObjectReferenceOptions.OBJECT_IDS, possibleValues)
                    );
                }
            }
        }
    }

}