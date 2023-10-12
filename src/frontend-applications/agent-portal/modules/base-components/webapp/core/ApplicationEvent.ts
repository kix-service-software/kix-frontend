/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum ApplicationEvent {

    APP_LOADING = 'APP_LOADING',

    REFRESH = 'APP_REFRESH',

    REFRESH_TOOLBAR = 'REFRESH_TOOLBAR',

    REFRESH_CONTENT = 'REFRESH_CONTENT',

    CLOSE_OVERLAY = 'CLOSE_OVERLAY',

    DROPDOWN_OPENED = 'DROPDOWN_OPENED',

    CACHE_KEYS_DELETED = 'CACHE_KEYS_DELETED',

    CACHE_CLEARED = 'CACHE_CLEARED',

    OBJECT_UPDATED = 'OBJECT_UPDATED',

    OBJECT_CREATED = 'OBJECT_CREATED',

    OBJECT_DELETED = 'OBJECT_DELETED',

    DIALOG_SUBMIT = 'DIALOG_SUBMIT',

    TOGGLE_LOADING_SHIELD = 'TOGGLE_LOADING_SHIELD',

    TOGGLE_CONFIGURATION_MODE = 'TOGGLE_CONFIGURATION_MODE',

    CONFIGURATIONS_RELOADED = 'CONFIGURATIONS_RELOADED'

}
