/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { DynamicFieldTypes } from "../../../dynamic-fields/model/DynamicFieldTypes";
import { InputFieldTypes } from "./InputFieldTypes";

export class SearchFormManager extends AbstractDynamicFormManager {

    public objectType: string;

    public async getProperties(): Promise<Array<[string, string]>> {
        for (const manager of this.extendedFormManager) {
            const extendedOperations = await manager.getProperties();
            if (extendedOperations) {
                return extendedOperations;
            }
        }

        const properties = [];
        if (await this.checkReadPermissions('/system/dynamicfields')) {

            let validDFTypes = [];
            this.extendedFormManager.forEach((m) => validDFTypes = [...validDFTypes, ...m.getValidDFTypes()]);

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
                            DynamicFieldTypes.TEXT,
                            DynamicFieldTypes.TEXT_AREA,
                            DynamicFieldTypes.DATE,
                            DynamicFieldTypes.DATE_TIME,
                            DynamicFieldTypes.SELECTION,
                            DynamicFieldTypes.CI_REFERENCE,
                            ...validDFTypes
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
        for (const manager of this.extendedFormManager) {
            const extendedOperations = await manager.getOperations(property);
            if (extendedOperations) {
                return extendedOperations;
            }
        }

        let operations: SearchOperator[] = [];

        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const field = await KIXObjectService.loadDynamicField(dfName);
            if (field) {
                switch (field.FieldType) {
                    case DynamicFieldTypes.TEXT:
                    case DynamicFieldTypes.TEXT_AREA:
                        operations = SearchDefinition.getStringOperators();
                        break;
                    case DynamicFieldTypes.SELECTION:
                    case DynamicFieldTypes.CI_REFERENCE:
                        operations = [SearchOperator.IN];
                        break;
                    case DynamicFieldTypes.DATE:
                    case DynamicFieldTypes.DATE_TIME:
                        operations = SearchDefinition.getDateTimeOperators();
                        break;
                    default:
                }
            }
        }
        return operations;
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        for (const manager of this.extendedFormManager) {
            const extendedInputTypes = await manager.getInputType(property);
            if (extendedInputTypes) {
                return extendedInputTypes;
            }
        }

        return super.getInputType(property);
    }

}
