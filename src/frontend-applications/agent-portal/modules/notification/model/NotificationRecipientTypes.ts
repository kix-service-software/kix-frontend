/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum NotificationRecipientTypes {

    AGENT_OWNER = 'AgentOwner',

    AGENT_RESPONSIBLE = 'AgentResponsible',

    AGENT_READ_PERMISSIONS = 'AgentReadPermissions',

    AGENT_WRITE_PERMISSIONS = 'AgentWritePermissions',

    AGENT_MY_QUEUES = 'AgentMyQueues',

    CUSTOMER = 'Customer',

    AGENT_WATCHER = 'AgentWatcher'
}
