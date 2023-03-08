/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum AgentEvent {

    GET_PERSONAL_SETTINGS = 'GET_PERSONAL_SETTINGS',

    GET_PERSONAL_SETTINGS_FINISHED = 'GET_PERSONAL_SETTINGS_FINISHED',

    SET_PREFERENCES = 'SET_PREFERENCES',

    SET_PREFERENCES_FINISHED = 'SET_PREFERENCES_FINISHED',

    GET_CURRENT_USER = 'GET_CURRENT_USER',

    GET_CURRENT_USER_FINISHED = 'GET_CURRENT_USER_FINISHED',

    CLEAR_CURRENT_USER_CACHE = 'CLEAR_CURRENT_USER_CACHE',

    CLEAR_CURRENT_USER_CACHE_FINISHED = 'CLEAR_CURRENT_USER_CACHE_FINISHED'

}
