/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum AuthenticationEvent {

    LOGIN = 'login',

    LOGOUT = 'logout',

    AUTHORIZED = 'authorized',

    UNAUTHORIZED = 'unauthorized',

    VALIDATE_TOKEN = 'validate-token',

    PERMISSION_CHECK = 'PERMISSION_CHECK',

    PERMISSION_CHECK_SUCCESS = 'PERMISSION_CHECK_SUCCESS',

    PERMISSION_CHECK_FAILED = 'PERMISSION_CHECK_FAILED'

}
