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
                let value = null;
                if (criterion.propertyValue) {
                    value = await PlaceholderService.getInstance().replacePlaceholders(
                        criterion.propertyValue, object
                    );
                } else {
                    value = object[criterion.property];
                }

                match = await FilterUtil.checkUIFilterCriterion(criterion, value);
                if (!match) {
                    break;
                }
            }
        }
        return match;
    }

    public static async checkUIFilterCriterion(criterion: UIFilterCriterion, value: any): Promise<boolean> {
        if (criterion.value === KIXObjectType.CURRENT_USER) {
            const currentUser = await AgentService.getInstance().getCurrentUser();
            criterion.value = currentUser.UserID;
        }

        const criterionValue = criterion.value ? criterion.value.toString().toLocaleLowerCase() : criterion.value;

        switch (criterion.operator) {
            case SearchOperator.EQUALS:
                value = value ? value : '';
                return value.toString().toLocaleLowerCase() === criterionValue;
            case SearchOperator.NOT_EQUALS:
                value = value ? value : '';
                return value.toString().toLocaleLowerCase() !== criterionValue;
            case SearchOperator.CONTAINS:
                value = value ? value : '';
                return value.toString().toLocaleLowerCase().indexOf(
                    criterion.value.toString().toLocaleLowerCase()
                ) !== -1;
            case SearchOperator.LESS_THAN:
                return Number(value) < criterion.value;
            case SearchOperator.LESS_THAN_OR_EQUAL:
                return Number(value) <= criterion.value;
            case SearchOperator.GREATER_THAN:
                return Number(value) > criterion.value;
            case SearchOperator.GREATER_THAN_OR_EQUAL:
                return Number(value) >= criterion.value;
            case SearchOperator.IN:
                return (criterion.value as any[]).some((cv) => {
                    if (typeof cv === 'undefined') {
                        return typeof value === 'undefined';
                    } else if (cv === null) {
                        return value === null || (Array.isArray(value) && value.some((v) => v === null));
                    } else {
                        if (cv instanceof KIXObject) {
                            if (Array.isArray(value)) {
                                return value.some((v) => v.equals(cv));
                            }
                        }
                        if (typeof value === 'number') {
                            return value === cv;
                        } else if (Array.isArray(value)) {
                            return value.some((v) => v.toString() === cv.toString());
                        } else if (typeof value === 'boolean') {
                            return Boolean(cv) === value;
                        } else {
                            return value ? value.toString().split(',').some((v) => v === cv.toString()) : false;
                        }
                    }
                });
            default:
        }
    }

}
