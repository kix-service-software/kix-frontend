/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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

    PRIORITY_ID = 'PriorityID',

    LOCK_ID = 'LockID',

    QUEUE_ID = 'QueueID',

    ORGANISATION_ID = 'OrganisationID',

    CONTACT_ID = 'ContactID',

    OWNER_ID = 'OwnerID',

    TYPE_ID = 'TypeID',

    SERVICE_ID = 'ServiceID',

    RESPONSIBLE_ID = 'ResponsibleID',

    AGE = 'Age',

    CREATED = 'Created',

    CREATED_TIME_UNIX = 'CreateTimeUnix',

    CHANGED = 'Changed',

    ARCHIVE_FLAG = 'ArchiveFlag',

    TICKET_NOTES = 'TicketNotes',

    WATCH_USER_ID = 'WatchUserID',

    CLOSE_TIME = 'CloseTime',

    PENDING_TIME = 'PendingTime',

    PENDING_TIME_UNIX = 'PendingTimeUnix',

    TIME_UNITS = 'TimeUnits',

    LAST_CHANGE_TIME = 'LastChangeTime',

    FROM = 'From',

    TO = 'To',

    CC = 'Cc',

    SUBJECT = 'Subject',

    BODY = 'Body',

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

    // UI properties
    STATE = 'State',
    STATE_TYPE = 'StateType',
    PRIORITY = 'Priority',
    LOCK = 'Lock',
    QUEUE = 'Queue',
    ORGANISATION = 'Organisation',
    CONTACT = 'Contact',
    OWNER = 'Owner',
    TYPE = 'Type',
    SLA = 'SLA',
    SERVICE = 'Service',
    RESPONSIBLE = 'Responsible',
    UNTIL_TIME = 'UntilTime',

}
