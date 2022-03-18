/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum SearchOperator {

    EQUALS = 'EQ',

    NOT_EQUALS = 'NE',

    LESS_THAN = 'LT',

    GREATER_THAN = 'GT',

    LESS_THAN_OR_EQUAL = 'LTE',

    GREATER_THAN_OR_EQUAL = 'GTE',

    BETWEEN = 'BETWEEN',

    IN = 'IN',

    CONTAINS = 'CONTAINS',

    STARTS_WITH = 'STARTSWITH',

    ENDS_WITH = 'ENDSWITH',

    LIKE = 'LIKE',

    // special datetime operators
    WITHIN_THE_LAST = 'WITHIN_THE_LAST',    // has to be done with two filters (>= xxx and < now)
    WITHIN_THE_NEXT = 'WITHIN_THE_NEXT',    // has to be done with two filters (> now and <= xxx)
    MORE_THAN_AGO = 'MORE_THAN_AGO',
    IN_MORE_THAN = 'IN_MORE_THAN',
    LESS_THAN_AGO = 'LESS_THAN_AGO',
    IN_LESS_THAN = 'IN_LESS_THAN',
}
