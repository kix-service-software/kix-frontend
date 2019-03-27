import { ImportPropertyOperator } from "./ImportPropertyOperator";

export class ImportPropertyOperatorUtil {

    public static getText(operator: ImportPropertyOperator): string {
        switch (operator) {
            case ImportPropertyOperator.REPLACE_EMPTY:
                return 'Leerwert ersetzen';
            case ImportPropertyOperator.FORCE:
                return 'Erzwingen';
            case ImportPropertyOperator.IGNORE:
                return 'Ignorieren';
            default:
                return operator;
        }
    }

}
