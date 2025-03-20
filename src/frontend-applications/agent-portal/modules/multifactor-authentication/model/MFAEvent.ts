/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum MFAEvent {

    MFA_REQUIRED_FOR_USER = 'MFA_REQUIRED_FOR_USER',

    MFA_REQUIRED_FOR_USER_FINISHED = 'MFA_REQUIRED_FOR_USER_FINISHED',

    LOAD_MFA_CONFIGS = 'LOAD_MFA_CONFIGS',

    MFA_CONFIGS_LOADED = 'MFA_CONFIGS_LOADED'

}