/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum CRUD {

    CREATE = 0x0001,

    READ = 0x0002,

    UPDATE = 0x0004,

    DELETE = 0x0008,

    DENY = 0xf000
}
