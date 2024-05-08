/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum TicketProperty {

    TICKET_NUMBER = 'TicketNumber',

    TITLE = 'Title',

    TICKET_ID = 'TicketID',

    STATE_ID = 'StateID',
    STATE = 'State',

    STATE_ID_PREVIOUS = 'StateIDPrevious',
    STATE_PREVIOUS = 'StatePrevious',

    PRIORITY_ID = 'PriorityID',
    PRIORITY = 'Priority',

    LOCK_ID = 'LockID',
    LOCK = 'Lock',

    QUEUE_ID = 'QueueID',
    QUEUE = 'Queue',

    QUEUE_FULLNAME = 'QueueFullname',

    ORGANISATION_ID = 'OrganisationID',
    ORGANISATION = 'Organisation',

    CONTACT_ID = 'ContactID',
    CONTACT = 'Contact',

    OWNER_ID = 'OwnerID',
    OWNER = 'Owner',
    OWNER_OOO = 'OwnerOutOfOffice',

    TYPE_ID = 'TypeID',
    TYPE = 'Type',

    RESPONSIBLE_ID = 'ResponsibleID',
    RESPONSIBLE = 'Responsible',
    RESPONSIBLE_OOO = 'ResponsibleOutOfOffice',

    AGE = 'Age',

    CREATED = 'Created',

    CREATED_TIME_UNIX = 'CreateTimeUnix',

    CHANGED = 'Changed',

    ARCHIVE_FLAG = 'ArchiveFlag',

    TICKET_NOTES = 'TicketNotes',

    WATCHER_USER_ID = 'WatcherUserID',

    WATCHER_ID = 'WatcherID',

    CLOSE_TIME = 'CloseTime',

    PENDING_TIME = 'PendingTime',

    PENDING_TIME_UNIX = 'PendingTimeUnix',

    LAST_CHANGE_TIME = 'LastChangeTime',

    ARTICLE_CREATE_TIME = 'ArticleCreateTime',

    ATTACHMENT_NAME = 'AttachmentName',

    TICKET_FLAG = 'TicketFlag',

    ARTICLE_FLAG = 'ArticleFlag',

    LINKED_AS = 'LinkedAs',

    LINK = 'Link',

    WATCHERS = 'Watchers',

    ARTICLES = 'Articles',

    UNSEEN = 'Unseen',

    HISTORY = 'History',

    STATE_TYPE_ID = 'StateTypeID',
    STATE_TYPE = 'StateType',

    CREATE_TIME = 'CreateTime',

    CHANGE_TIME = 'ChangeTime',

    CREATED_PRIORITY_ID = 'CreatedPriorityID',

    CREATED_QUEUE_ID = 'CreatedQueueID',

    CREATED_STATE_ID = 'CreatedStateID',

    CREATED_TYPE_ID = 'CreatedTypeID',

    CREATED_USER_ID = 'CreatedUserID', // TODO: depricated use CreateByID instead if necessary

    UNTIL_TIME = 'UntilTime'
}
