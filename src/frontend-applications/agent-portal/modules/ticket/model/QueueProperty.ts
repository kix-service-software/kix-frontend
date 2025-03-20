/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum QueueProperty {

    QUEUE_ID = 'QueueID',

    NAME = 'Name',

    FULLNAME = 'Fullname',

    COMMENT = 'Comment',

    SYSTEM_ADDRESS_ID = 'SystemAddressID',

    FOLLOW_UP_ID = 'FollowUpID',

    FOLLOW_UP_LOCK = 'FollowUpLock',

    UNLOCK_TIMEOUT = 'UnlockTimeout',

    SIGNATURE = 'Signature',

    PARENT_ID = 'ParentID',

    SUB_QUEUES = 'SubQueues',

    PERMISSIONS = 'Permissions',

    ASSIGNED_PERMISSIONS = 'AssignedPermissions',

    // UI properties
    VALID = 'Valid',
    PARENT = 'Parent',
    SYSTEM_ADDRESS = 'SystemAddress',
    FOLLOW_UP = 'FollowUp'
}
