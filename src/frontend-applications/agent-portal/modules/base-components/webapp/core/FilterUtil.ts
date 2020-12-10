/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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
        return value ? value.toString().toLocaleLowerCase().toLocaleString().replace(/\u200E/g, '') : '';
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
                objectValue = await this.getDynamicFieldValue(object, criterion, objectValue);

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
            const objects = await KIXObjectService.loadObjects(
                object.KIXObjectType, [object.ObjectId],
                new KIXObjectLoadingOptions(null, null, null, [KIXObjectProperty.DYNAMIC_FIELDS])
            );
            if (Array.isArray(objects) && objects.length && Array.isArray(objects[0].DynamicFields)) {
                const dynamicField = objects[0].DynamicFields.find((d) => d.Name === dfName);
                if (dynamicField) {
                    dfValue = dynamicField.Value;
                }
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
            objectValue = currentUser.UserID;
        }

        const criterionValue = objectValue !== null && typeof objectValue !== 'undefined'
            ? objectValue.toString().toLocaleLowerCase()
            : objectValue;

        switch (operator) {
            case SearchOperator.EQUALS:
                filterValue = filterValue ? filterValue.toString().toLocaleLowerCase() : filterValue;
                return filterValue === criterionValue;
            case SearchOperator.NOT_EQUALS:
                filterValue = filterValue !== undefined && filterValue !== null
                    ? filterValue.toString().toLocaleLowerCase()
                    : filterValue;
                return filterValue !== criterionValue;
            case SearchOperator.CONTAINS:
                filterValue = filterValue !== undefined && filterValue !== null
                    ? filterValue
                    : '';
                return objectValue.toString().toLocaleLowerCase().indexOf(
                    filterValue.toString().toLocaleLowerCase()
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
                return (objectValue as any[]).some((cv) => {
                    if (typeof cv === 'undefined') {
                        return typeof filterValue === 'undefined';
                    } else if (cv === null) {
                        return filterValue === null ||
                            (Array.isArray(filterValue) && filterValue.some((v) => v === null));
                    } else {
                        if (cv instanceof KIXObject) {
                            if (Array.isArray(filterValue)) {
                                return filterValue.some((v) => v.equals(cv));
                            }
                        }
                        if (typeof filterValue === 'number') {
                            return filterValue === cv;
                        } else if (Array.isArray(filterValue)) {
                            return filterValue.some((v) => v.toString() === cv.toString());
                        } else if (typeof filterValue === 'boolean') {
                            return Boolean(cv) === filterValue;
                        } else {
                            return filterValue
                                ? filterValue.toString().split(',').some((v) => v === cv.toString())
                                : false;
                        }
                    }
                });
            default:
        }
    }

}
