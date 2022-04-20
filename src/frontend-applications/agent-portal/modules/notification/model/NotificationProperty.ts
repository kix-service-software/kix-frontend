/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum NotificationProperty {

    ID = 'ID',

    NAME = 'Name',

    MESSAGE = 'Message',

    MESSAGE_SUBJECT = 'Subject',

    MESSAGE_BODY = 'Body',

    DATA = 'Data',

    DATA_VISIBLE_FOR_AGENT = 'VisibleForAgent',

    DATA_VISIBLE_FOR_AGENT_TOOLTIP = 'VisibleForAgentTooltip',

    DATA_EVENTS = 'Events',

    DATA_RECIPIENTS = 'Recipients',

    DATA_RECIPIENT_AGENTS = 'RecipientAgents',

    DATA_RECIPIENT_EMAIL = 'RecipientEmail',

    DATA_RECIPIENT_ROLES = 'RecipientRoles',

    DATA_RECIPIENT_SUBJECT = 'RecipientSubject',

    DATA_SEND_DESPITE_OOO = 'SendOnOutOfOffice',

    DATA_SEND_ONCE_A_DAY = 'OncePerDay',

    FILTER = 'Filter',

    DATA_CREATE_ARTICLE = 'CreateArticle'

}
