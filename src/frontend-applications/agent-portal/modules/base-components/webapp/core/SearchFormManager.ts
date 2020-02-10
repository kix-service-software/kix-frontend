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
import { SearchDefinition } from "../../../search/webapp/core/SearchDefinition";
import { InputFieldTypes } from "./InputFieldTypes";
import { DynamicFieldType } from "../../../dynamic-fields/model/DynamicFieldType";
import { DynamicFieldService } from "../../../dynamic-fields/webapp/core/DynamicFieldService";

export class SearchFormManager extends AbstractDynamicFormManager {
    public objectType: string;

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties = [];
        if (await this.checkReadPermissions('/system/dynamicfields')) {
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
                            DynamicFieldType.TEXT, DynamicFieldType.TEXT_AREA, DynamicFieldType.DATE,
                            DynamicFieldType.DATE_TIME, DynamicFieldType.SELECTION, DynamicFieldType.CI_REFERENCE
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
        }

        return properties;
    }

    public async getOperations(property: string): Promise<any[]> {
        let operations: SearchOperator[] = [];
        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const field = await KIXObjectService.loadDynamicField(dfName);
            if (field) {
                switch (field.FieldType) {
                    case DynamicFieldType.TEXT:
                    case DynamicFieldType.TEXT_AREA:
                        operations = SearchDefinition.getStringOperators();
                        break;
                    case DynamicFieldType.SELECTION:
                    case DynamicFieldType.CI_REFERENCE:
                        operations = [SearchOperator.IN];
                        break;
                    case DynamicFieldType.DATE:
                    case DynamicFieldType.DATE_TIME:
                        operations = SearchDefinition.getDateTimeOperators();
                        break;
                    default:
                }
            }
        }
        return operations;
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        let inputType = InputFieldTypes.TEXT;
        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const field = await KIXObjectService.loadDynamicField(dfName);
            if (field) {
                if (field.FieldType === DynamicFieldType.SELECTION) {
                    inputType = InputFieldTypes.DROPDOWN;
                } else if (field.FieldType === DynamicFieldType.DATE) {
                    inputType = InputFieldTypes.DATE;
                } else if (field.FieldType === DynamicFieldType.DATE_TIME) {
                    inputType = InputFieldTypes.DATE_TIME;
                }
            }
        }

        return inputType;
    }



}
