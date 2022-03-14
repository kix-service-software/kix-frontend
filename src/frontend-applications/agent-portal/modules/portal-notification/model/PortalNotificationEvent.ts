/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum PortalNotificationEvent {

    PRE_LOGIN_NOTIFICATIONS_UPDATED = 'PRE_LOGIN_NOTIFICATIONS_UPDATED',
    NOTIFICATIONS_UPDATED = 'NOTIFICATIONS_UPDATED',

    GET_PRELOGIN_NOTIFICATIONS = 'GET_PRELOGIN_NOTIFICATIONS',
    GET_PRELOGIN_NOTIFICATIONS_FINISHED = 'GET_PRELOGIN_NOTIFICATIONS_FINISHED',

    GET_NOTIFICATIONS = 'GET_NOTIFICATIONS',
    GET_NOTIFICATIONS_FINISHED = 'GET_NOTIFICATIONS_FINISHED',

    NOTIFICATION_PUSHED = 'NOTIFICATION_PUSHED'

}