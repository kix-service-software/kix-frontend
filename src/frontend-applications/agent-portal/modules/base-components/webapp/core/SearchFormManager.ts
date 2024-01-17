/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { TreeNode } from './tree';
import { LabelService } from './LabelService';
import { SortDataType } from '../../../../model/SortDataType';

export class SearchFormManager extends AbstractDynamicFormManager {

    public objectType: string;

    public ignoreProperties: string[] = [];

    public setIgnoreProperties(properties: string[] = []): void {
        this.ignoreProperties = properties;
    }

    public async getOperations(property: string): Promise<Array<string | SearchOperator>> {
        let operations: Array<string | SearchOperator> = [];

        const superOperations = await super.getOperations(property);
        if (superOperations) {
            operations = superOperations;
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
                    case DynamicFieldTypes.TABLE:
                        operations = [SearchOperator.CONTAINS, SearchOperator.LIKE];
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

    public async getSortAttributeTree(withDynamicFields: boolean = true): Promise<TreeNode[]> {
        const supportedAttributes = await KIXObjectService.getSortableAttributes(this.objectType);
        const nodes: TreeNode[] = [];
        if (Array.isArray(supportedAttributes)) {
            const labelPromises = [];
            for (const sA of supportedAttributes) {
                labelPromises.push(
                    new Promise<void>(async (resolve) => {
                        const label = await LabelService.getInstance().getPropertyText(
                            sA.Property, this.objectType
                        );
                        nodes.push(new TreeNode(sA.Property, label));
                        resolve();
                    })
                );
            }
            await Promise.all(labelPromises);
        }
        return nodes.sort((a, b) => a.label.localeCompare(b.label));
    }

    public async getSortAttributeType(attribute: string): Promise<string> {
        const supportedAttributes = await KIXObjectService.getSortableAttributes(this.objectType);
        const relevantAttribute = supportedAttributes.find((sA) => sA.Property === attribute);
        return relevantAttribute?.ValueType || SortDataType.TEXTUAL;
    }
}
