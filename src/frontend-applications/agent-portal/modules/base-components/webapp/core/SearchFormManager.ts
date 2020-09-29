/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractDynamicFormManager } from './dynamic-form';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { KIXObjectService } from './KIXObjectService';
import { SearchDefinition } from '../../../search/webapp/core/SearchDefinition';
import { DynamicFieldTypes } from '../../../dynamic-fields/model/DynamicFieldTypes';

export class SearchFormManager extends AbstractDynamicFormManager {

    public objectType: string;

    public async getOperations(property: string): Promise<Array<string | SearchOperator>> {
        let operations: Array<string | SearchOperator> = [];

        for (const manager of this.extendedFormManager) {
            const extendedOperations = await manager.getOperations(property);
            if (extendedOperations) {
                operations = [...operations, ...extendedOperations];
            }
        }

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
                    case DynamicFieldTypes.TICKET_REFERENCE:
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

        return operations.filter((o, index) => operations.indexOf(o) === index);
    }

}
