/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { UIFilterCriterion } from '../../../../model/UIFilterCriterion';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { AgentService } from '../../../user/webapp/core/AgentService';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { PlaceholderService } from './PlaceholderService';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';

export class FilterUtil {

    public static prepareFilterValue(value: string): string {
        return value ? value?.toString().toLocaleLowerCase().toLocaleString().replace(/\u200E/g, '') : '';
    }

    public static stringContains(displayValue: string, filterValue: string): boolean {
        filterValue = FilterUtil.prepareFilterValue(filterValue);
        displayValue = FilterUtil.prepareFilterValue(displayValue);
        return displayValue.indexOf(filterValue) !== -1;
    }

    public static async checkCriteriaByPropertyValue(
        criteria: UIFilterCriterion[], object: KIXObject
    ): Promise<boolean> {
        let match = true;
        if (Array.isArray(criteria)) {
            for (const criterion of criteria) {
                const value = typeof criterion.value === 'string'
                    ? await PlaceholderService.getInstance().replacePlaceholders(criterion.value, object)
                    : criterion.value;

                let objectValue = object[criterion.property];

                if (!objectValue) {
                    objectValue = await this.getDynamicFieldValue(object, criterion, objectValue);
                }

                if (!objectValue && typeof criterion.property === 'string') {
                    objectValue = await PlaceholderService.getInstance().replacePlaceholders(
                        criterion.property, object
                    );
                }

                match = await FilterUtil.checkUIFilterCriterion(objectValue, criterion.operator, value);
                if (!match) {
                    break;
                }
            }
        }
        return match;
    }

    private static async getDynamicFieldValue(
        object: KIXObject, criterion: UIFilterCriterion, defaultValue: any
    ): Promise<any> {
        let dfValue = null;
        const dfName = KIXObjectService.getDynamicFieldName(criterion.property);
        if (dfName) {
            if (!object?.DynamicFields || !object?.DynamicFields?.length) {
                const objects = await KIXObjectService.loadObjects(
                    object.KIXObjectType, [object.ObjectId],
                    new KIXObjectLoadingOptions(null, null, null, [KIXObjectProperty.DYNAMIC_FIELDS])
                ).catch(() => []);

                if (objects?.length) {
                    object = objects[0];
                }
            }

            const dynamicField = object?.DynamicFields?.find((d) => d.Name === dfName);
            if (dynamicField) {
                dfValue = dynamicField.Value;
            }

        } else {
            dfValue = defaultValue;
        }

        return dfValue;
    }

    public static async checkUIFilterCriterion(
        objectValue: any, operator: SearchOperator, filterValue: any
    ): Promise<boolean> {
        if (filterValue === KIXObjectType.CURRENT_USER) {
            const currentUser = await AgentService.getInstance().getCurrentUser();
            filterValue = currentUser.UserID;
        }

        const criterionValue = objectValue !== null && typeof objectValue !== 'undefined'
            ? objectValue?.toString().toLocaleLowerCase()
            : objectValue;

        switch (operator) {
            case SearchOperator.EQUALS:
                filterValue = filterValue ? filterValue?.toString().toLocaleLowerCase() : filterValue;
                return filterValue === criterionValue;
            case SearchOperator.NOT_EQUALS:
                filterValue = filterValue !== undefined && filterValue !== null
                    ? filterValue?.toString().toLocaleLowerCase()
                    : filterValue;
                return filterValue !== criterionValue;
            case SearchOperator.CONTAINS:
                filterValue = filterValue !== undefined && filterValue !== null
                    ? filterValue
                    : '';
                return objectValue?.toString().toLocaleLowerCase().indexOf(
                    filterValue?.toString().toLocaleLowerCase()
                ) !== -1;
            case SearchOperator.LESS_THAN:
                return objectValue < Number(filterValue);
            case SearchOperator.LESS_THAN_OR_EQUAL:
                return objectValue <= Number(filterValue);
            case SearchOperator.GREATER_THAN:
                return objectValue > Number(filterValue);
            case SearchOperator.GREATER_THAN_OR_EQUAL:
                return objectValue >= Number(filterValue);
            case SearchOperator.IN:
                return Array.isArray(filterValue) ? (filterValue as any[]).some((cv) => {
                    if (typeof cv === 'undefined') {
                        return typeof objectValue === 'undefined';
                    } else if (cv === null) {
                        return objectValue === null ||
                            (Array.isArray(objectValue) && objectValue.some((v) => v === null));
                    } else {
                        if (cv instanceof KIXObject) {
                            if (Array.isArray(objectValue)) {
                                return objectValue.some((v) => v.equals(cv));
                            }
                        }
                        if (typeof objectValue === 'number') {
                            return objectValue === cv;
                        } else if (Array.isArray(objectValue)) {
                            return objectValue.some((v) => v?.toString() === cv?.toString());
                        } else if (typeof objectValue === 'boolean') {
                            return Boolean(cv) === objectValue;
                        } else {
                            return objectValue !== null && typeof objectValue !== 'undefined'
                                ? objectValue.toString().split(',').some((v) => v === cv?.toString())
                                : false;
                        }
                    }
                }) : false;
            default:
        }
    }

}
