/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum ContextEvents {

    CONTEXT_CREATED = 'CONTEXT_CREATED',

    CONTEXT_REMOVED = 'CONTEXT_REMOVED',

    CONTEXT_UPDATE_REQUIRED = 'CONTEXT_UPDATE_REQUIRED',

    CONTEXT_CHANGED = 'CONTEXT_CHANGED',

    CONTEXT_DISPLAY_TEXT_CHANGED = 'CONTEXT_DISPLAY_TEXT_CHANGED',

    CONTEXT_ICON_CHANGED = 'CONTEXT_ICON_CHANGED',

    CONTEXT_STORED = 'CONTEXT_STORED',

    CONTEXT_REORDERED = 'CONTEXT_REORDERED',

    CONTEXT_PARAMETER_CHANGED = 'CONTEXT_PARAMETER_CHANGED',

    CONTEXT_USER_WIDGETS_CHANGED = 'CONTEXT_USER_WIDGETS_CHANGED'

}