/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum SysConfigKey {

    ACCOUNT_TIME = 'Ticket::Frontend::AccountTime',

    KIX_VERSION = 'Version',

    KIX_PRODUCT = 'Product',

    TICKET_HOOK = 'Ticket::Hook',

    TICKET_HOOK_DIVIDER = 'Ticket::HookDivider',

    FAQ_HOOK = 'FAQ::FAQHook',

    CONFIG_ITEM_HOOK = 'ITSMConfigItem::Hook',

    TIME_UNITS = 'Ticket::Frontend::TimeUnits',

    DEFAULT_USED_LANGUAGES = 'DefaultUsedLanguages',

    DEFAULT_LANGUAGE = 'DefaultLanguage',

    MAX_ALLOWED_SIZE = 'FileUpload::MaxAllowedSize',

    IMPRINT_LINK = 'ImprintLink',

    CONFIG_LEVEL = 'ConfigLevel',

    TICKET_EVENTS = 'Events###Ticket',

    ARTICLE_EVENTS = 'Events###Article',

    POSTMASTER_X_HEADER = 'PostmasterX-Header',

    TICKET_VIEWABLE_STATE_TYPE = 'Ticket::ViewableStateType',

    USER_MANUAL = 'KIX::UserManual',

    ADMIN_MANUAL = 'KIX::AdminManual'

}
