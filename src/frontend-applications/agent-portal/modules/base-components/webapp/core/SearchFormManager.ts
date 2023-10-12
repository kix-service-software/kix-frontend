/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { DynamicFieldProperty } from '../../../dynamic-fields/model/DynamicFieldProperty';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ExtendedSearchFormManager } from './ExtendedSearchFormManager';

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
        let nodes: TreeNode[] = [];
        for (const manager of this.extendedFormManager) {
            const extendedNodes = await (manager as ExtendedSearchFormManager).getSortNodes();
            if (extendedNodes?.length) {
                nodes = [...nodes, ...extendedNodes];
            }
        }

        if (withDynamicFields && await this.checkReadPermissions('/system/dynamicfields')) {
            let validTypes = this.validDFTypes;
            (this.extendedFormManager as ExtendedSearchFormManager[]).forEach((m) => {
                if (typeof m.getSortableDFTypes === 'function') {
                    validTypes = [...validTypes, ...m.getSortableDFTypes()];
                }
            });

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
                            // TODO: ignore, because pointless - sorted by "ids" instead "labels" of referenced objects
                            // DynamicFieldTypes.SELECTION,
                            // DynamicFieldTypes.CI_REFERENCE,
                            // DynamicFieldTypes.TICKET_REFERENCE,
                            // DynamicFieldTypes.TABLE,
                            // DynamicFieldTypes.CHECK_LIST,
                            ...validTypes
                        ]
                    )
                ]
            );

            // TODO: currently only valid DFs
            // if (validDynamicFields) {
            loadingOptions.filter.push(
                new FilterCriteria(
                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS,
                    FilterDataType.NUMERIC, FilterType.AND, 1
                )
            );
            // }

            const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
                KIXObjectType.DYNAMIC_FIELD, null, loadingOptions
            ).catch(() => [] as DynamicField[]);

            if (dynamicFields && dynamicFields.length) {
                for (const df of dynamicFields) {
                    if (
                        df.FieldType === DynamicFieldTypes.CI_REFERENCE
                        && !await this.checkReadPermissions('/cmdb/configitems')
                    ) { continue; }
                    if (
                        df.FieldType === DynamicFieldTypes.TICKET_REFERENCE
                        && !await this.checkReadPermissions('/tickets')
                    ) { continue; }
                    const label = await TranslationService.translate(df.Label);
                    nodes.push(
                        new TreeNode(`${KIXObjectProperty.DYNAMIC_FIELDS}.${df.Name}`, label)
                    );
                }
            }
        }
        return nodes;
    }

    public async getSortAttributeType(attribute: string): Promise<string> {
        for (const manager of this.extendedFormManager) {
            if (typeof (manager as ExtendedSearchFormManager).getSortAttributeType === 'function') {
                const type = await (manager as ExtendedSearchFormManager).getSortAttributeType(attribute);
                if (type) {
                    return type;
                }
            }
        }
        return;
    }
}
