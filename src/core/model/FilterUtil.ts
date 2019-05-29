import { TableFilterCriteria } from "./components";
import { SearchOperator } from "../browser";
import { KIXObjectType, KIXObject } from "./kix";
import { ObjectDataService } from "../browser/ObjectDataService";
import { AgentService } from "../browser/application/AgentService";

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
                return value.toString().toLocaleLowerCase() === criteria.value.toString().toLocaleLowerCase();
            case SearchOperator.CONTAINS:
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
                        } else {
                            return v.equals(value);
                        }
                    }
                    return v.toString() === value.toString();
                });
            default:
        }
    }

}
