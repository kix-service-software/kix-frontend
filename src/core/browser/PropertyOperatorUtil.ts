import { PropertyOperator } from "./PropertyOperator";

export class PropertyOperatorUtil {

    public static getText(operator: PropertyOperator): string {
        switch (operator) {
            case PropertyOperator.CHANGE:
                return 'Ändern in';
            case PropertyOperator.CLEAR:
                return 'Leeren';
            default:
                return operator;
        }
    }

}
