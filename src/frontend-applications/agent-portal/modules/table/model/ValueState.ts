/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum ValueState {

    CHANGED = 1 << 0,

    DELETED,

    NEW,

    NOT_EXISTING,

    NONE,

    NEW_MARKED,

    HIGHLIGHT_ERROR,

    HIGHLIGHT_REMOVED,

    HIGHLIGHT_UNAVAILABLE,

    HIGHLIGHT_SUCCESS

}
