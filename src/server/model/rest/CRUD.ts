/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
