/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum SocketEvent {

    CONNECT = 'connect',

    CONNECT_ERROR = 'connect_error',

    CONNECT_TIMEOUT = 'connect_timeout',

    CONNECTION = 'connection',

    PERMISSION_ERROR = 'PERMISSION_ERROR',

    ERROR = 'ERROR',

    INVALID_TOKEN = 'INVALID_TOKEN'

}
