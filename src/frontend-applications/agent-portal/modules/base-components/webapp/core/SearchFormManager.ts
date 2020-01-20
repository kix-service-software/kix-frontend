/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractDynamicFormManager } from "./dynamic-form";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { DynamicFieldProperty } from "../../../dynamic-fields/model/DynamicFieldProperty";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { KIXObjectService } from "./KIXObjectService";
import { DynamicField } from "../../../dynamic-fields/model/DynamicField";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { SearchDefinition } from "../../../search/webapp/core";
import { InputFieldTypes } from "./InputFieldTypes";

export class SearchFormManager extends AbstractDynamicFormManager {
    public objectType: string;

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties = [];
        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    DynamicFieldProperty.OBJECT_TYPE, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, this.objectType
                ),
                new FilterCriteria(
                    DynamicFieldProperty.FIELD_TYPE, SearchOperator.IN,
                    FilterDataType.STRING, FilterType.AND,
                    [
                        'Text', 'TextArea', 'Date', 'DateTime', 'Multiselect'
                    ]
                ),
                new FilterCriteria(
                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS,
                    FilterDataType.NUMERIC, FilterType.AND, 1
                )
            ]
        );
        const fields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null, loadingOptions
        );

        if (fields) {
            for (const field of fields) {
                properties.push([KIXObjectProperty.DYNAMIC_FIELDS + '.' + field.Name, field.Label]);
            }
        }

        return properties;
    }

    public async getOperations(property: string): Promise<any[]> {
        let operations: SearchOperator[] = [];
        const field = await this.loadDynamicField(property);
        if (field) {
            if (field.FieldType === 'Text' || field.FieldType === 'TextArea') {
                operations = SearchDefinition.getStringOperators();
            } else if (field.FieldType === 'Multiselect') {
                operations = [SearchOperator.IN];
            } else if (field.FieldType === 'Date' || field.FieldType === 'DateTime') {
                operations = SearchDefinition.getDateTimeOperators();
            }
        }
        return operations;
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        let inputType = InputFieldTypes.TEXT;
        const field = await this.loadDynamicField(property);
        if (field) {
            if (field.FieldType === 'Multiselect') {
                inputType = InputFieldTypes.DROPDOWN;
            } else if (field.FieldType === 'Date') {
                inputType = InputFieldTypes.DATE;
            } else if (field.FieldType === 'DateTime') {
                inputType = InputFieldTypes.DATE_TIME;
            }
        }

        return inputType;
    }



}
