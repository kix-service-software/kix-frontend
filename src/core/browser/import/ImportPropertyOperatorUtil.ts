import { ImportPropertyOperator } from "./ImportPropertyOperator";

export class ImportPropertyOperatorUtil {

    public static getText(operator: ImportPropertyOperator): string {
        switch (operator) {
            case ImportPropertyOperator.REPLACE_EMPTY:
                return 'Translatable#Replace empty value';
            case ImportPropertyOperator.FORCE:
                return 'Translatable#Force';
            case ImportPropertyOperator.IGNORE:
                return 'Translatable#Ignore';
            default:
                return operator;
        }
    }

}
