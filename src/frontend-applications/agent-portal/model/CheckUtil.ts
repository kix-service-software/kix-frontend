/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class CheckUtil {

    public static isNumeric(testString: any): boolean {
        return typeof testString === 'number' ||
            (typeof testString === 'string' && Boolean(testString.match(/^\d+$/)));
    }

}
