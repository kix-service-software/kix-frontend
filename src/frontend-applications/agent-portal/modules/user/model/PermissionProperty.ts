/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum PermissionProperty {

    ID = 'ID',

    RoleID = 'RoleID',

    TYPE_ID = 'TypeID',

    COMMENT = 'Comment',

    VALUE = 'Value',

    TARGET = 'Target',

    IS_REQUIRED = 'IsRequired',

    CREATE_TIME = 'CreateTime',

    CREATE_BY = 'CreateBy',

    CHANGE_TIME = 'ChangeTime',

    CHANGE_BY = 'ChangeBy',

    // CRUD Properties for UI

    CREATE = 'CREATE',

    READ = 'READ',

    UPDATE = 'UPDATE',

    DELETE = 'DELETE',

    DENY = 'DENY'

}
