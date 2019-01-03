import { SearchOperator } from "./SearchOperator";

export class SearchOperatorUtil {

    public static getText(operator: SearchOperator): string {
        switch (operator) {
            case SearchOperator.CONTAINS:
                return "Enthält";
            case SearchOperator.ENDS_WITH:
                return "Endet mit";
            case SearchOperator.EQUALS:
                return "Ist gleich";
            case SearchOperator.GREATER_THAN:
                return "Größer als";
            case SearchOperator.GREATER_THAN_OR_EQUAL:
                return "Größer gleich";
            case SearchOperator.IN:
                return "Enthalten in";
            case SearchOperator.LESS_THAN:
                return "Kleiner als";
            case SearchOperator.LESS_THAN_OR_EQUAL:
                return "Kleiner gleich";
            case SearchOperator.LIKE:
                return "Entspricht";
            case SearchOperator.NOT_EQUALS:
                return "Ungleich";
            case SearchOperator.STARTS_WITH:
                return "Beginnt mit";
            default:
                return operator;
        }
    }

}
