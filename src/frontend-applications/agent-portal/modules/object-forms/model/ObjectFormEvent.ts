/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum ObjectFormEvent {

    FIELD_ORDER_CHANGED = 'FIELD_ORDER_CHANGED',

    OBJECT_FORM_VALUE_MAPPER_INITIALIZED = 'OBJECT_FORM_VALUE_MAPPER_INITIALIZED',

    OBJECT_FORM_VALUE_CHANGED = 'OBJECT_FORM_VALUE_CHANGED',

    SCROLL_TO_FORM_VALUE = 'SCROLL_TO_FORM_VALUE',

    BLOCK_FORM = 'BLOCK_FORM',

    FORM_VALUE_ADDED = 'FORM_VALUE_ADDED',

    FORM_SUBMIT_ENABLED = 'FORM_SUBMIT_ENABLED'

}