/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFilterCriteria } from "../../../../model/TableFilterCriteria";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { AgentService } from "../../../user/webapp/core";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { KIXObject } from "../../../../model/kix/KIXObject";

export class FilterUtil {

    public static prepareFilterValue(value: string): string {
        return value ? value.toLocaleLowerCase().toLocaleString().replace(/\u200E/g, "") : '';
    }

    public static stringContains(displayValue: string, filterValue: string): boolean {
        filterValue = FilterUtil.prepareFilterValue(filterValue);
        displayValue = FilterUtil.prepareFilterValue(displayValue);
        return displayValue.indexOf(filterValue) !== -1;
    }

    public static async checkTableFilterCriteria(criteria: TableFilterCriteria, value: any): Promise<boolean> {
        if (criteria.value === KIXObjectType.CURRENT_USER) {
            const currentUser = await AgentService.getInstance().getCurrentUser();
            criteria.value = currentUser.UserID;
        }

        switch (criteria.operator) {
            case SearchOperator.EQUALS:
                value = value ? value : '';
                return value.toString().toLocaleLowerCase() === criteria.value.toString().toLocaleLowerCase();
            case SearchOperator.CONTAINS:
                value = value ? value : '';
                return value.toString().toLocaleLowerCase().indexOf(
                    criteria.value.toString().toLocaleLowerCase()
                ) !== -1;
            case SearchOperator.LESS_THAN:
                return Number(value) < criteria.value;
            case SearchOperator.LESS_THAN_OR_EQUAL:
                return Number(value) <= criteria.value;
            case SearchOperator.GREATER_THAN:
                return Number(value) > criteria.value;
            case SearchOperator.GREATER_THAN_OR_EQUAL:
                return Number(value) >= criteria.value;
            case SearchOperator.IN:
                return (criteria.value as any[]).some((v) => {
                    if (v instanceof KIXObject) {
                        if (Array.isArray(value)) {
                            return value.some((sv) => sv.equals(v));
                        }
                    }
                    if (typeof value === 'number') {
                        return value === v;
                    } else {
                        return value ? value.toString().indexOf(v.toString()) !== -1 : false;
                    }
                });
            default:
        }
    }

}