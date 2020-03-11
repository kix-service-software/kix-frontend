/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { PropertyOperator } from "./PropertyOperator";

export class PropertyOperatorUtil {

    public static getText(operator: PropertyOperator): string {
        switch (operator) {
            case PropertyOperator.CHANGE:
                return 'Translatable#Change to';
            case PropertyOperator.CLEAR:
                return 'Translatable#Clear';
            default:
                return operator;
        }
    }

}
