import { TableFilterCriteria } from "./components";
import { SearchOperator, ContextService } from "../browser";
import { KIXObjectType } from "./kix";

export class FilterUtil {

    public static prepareFilterValue(value: string): string {
        return value ? value.toLocaleLowerCase().toLocaleString().replace(/\u200E/g, "") : '';
    }

    public static stringContains(displayValue: string, filterValue: string): boolean {
        filterValue = FilterUtil.prepareFilterValue(filterValue);
        displayValue = FilterUtil.prepareFilterValue(displayValue);
        return displayValue.indexOf(filterValue) !== -1;
    }

    public static checkTableFilterCriteria(criteria: TableFilterCriteria, value: any): boolean {
        value = value.toString();

        if (criteria.value === KIXObjectType.CURRENT_USER) {
            criteria.value = ContextService.getInstance().getObjectData().currentUser.UserID;
        }

        switch (criteria.operator) {
            case SearchOperator.EQUALS:
                return value.toString().toLocaleLowerCase() === criteria.value.toString().toLocaleLowerCase();
            case SearchOperator.CONTAINS:
                return value.toLocaleLowerCase().indexOf(criteria.value.toString().toLocaleLowerCase()) !== -1;
            case SearchOperator.LESS_THAN:
                return Number(value) < criteria.value;
            case SearchOperator.LESS_THAN_OR_EQUAL:
                return Number(value) <= criteria.value;
            case SearchOperator.GREATER_THAN:
                return Number(value) > criteria.value;
            case SearchOperator.GREATER_THAN_OR_EQUAL:
                return Number(value) >= criteria.value;
            case SearchOperator.IN:
                return (criteria.value as any[]).some((v) => v.toString() === value.toString());
            default:
        }
    }

}
