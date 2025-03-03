/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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

    DEFAULT_USED_LANGUAGES = 'DefaultUsedLanguages',

    DEFAULT_LANGUAGE = 'DefaultLanguage',

    MAX_ALLOWED_SIZE = 'FileUpload::MaxAllowedSize',

    MAX_ALLOWED_ICON_SIZE = 'ObjectIcon::MaxAllowedSize',

    IMPRINT_LINK = 'ImprintLink',

    CONFIG_LEVEL = 'ConfigLevel',

    CONTACT_EVENTS = 'Events###Contact',

    TICKET_EVENTS = 'Events###Ticket',

    ARTICLE_EVENTS = 'Events###Article',

    POSTMASTER_X_HEADER = 'PostmasterX-Header',

    TICKET_VIEWABLE_STATE_TYPE = 'Ticket::ViewableStateType',

    SELF_SERVICE_MANUAL = 'KIX::SelfServiceManual',

    USER_MANUAL = 'KIX::UserManual',

    ADMIN_MANUAL = 'KIX::AdminManual',

    POSTMASTER_DEFAULT_QUEUE = 'PostmasterDefaultQueue',

    POSTMASTER_DEFAULT_PRIORITY = 'PostmasterDefaultPriority',

    POSTMASTER_DEFAULT_STATE = 'PostmasterDefaultState',

    TICKET_TYPE_DEFAULT = 'Ticket::Type::Default',

    BROWSER_SOCKET_TIMEOUT_CONFIG = 'Agent::Portal::Browser::Socket::Timeout',

    TICKET_SEARCH_INDEX_STOPWORDS = 'Ticket::SearchIndex::StopWords',

    TICKET_FRONTEND_PENDING_DIFF_TIME = 'Ticket::Frontend::PendingDiffTime',

    TICKET_SUBJECT_RE = 'Ticket::SubjectRe',

    TICKET_SUBJECT_FW = 'Ticket::SubjectFwd',

    SETUP_ASSISTANT_STATE = 'SetupAssistantState',

    DYNAMIC_FIELD_OBJECT_TYPE = 'DynamicFields::ObjectType',

    HTTP_TYPE = 'HttpType',

    FQDN = 'FQDN',

    GENERAL_CATALOG_PREFERENCES = 'GeneralCatalogPreferences',

    FRONTEND_RICHTEXT_DEFAULT_CSS = 'Frontend::RichText::DefaultCSS',

    TICKET_FRONTEND_NEED_ACCOUNTED_TIME = 'Ticket::Frontend::NeedAccountedTime',

    TICKET_STATE_DEFAULT = 'Ticket::State::Default',

    TICKET_PRIORITY_DEFAULT = 'Ticket::Priority::Default',

    TICKET_QUEUE_DEFAULT = 'Ticket::Queue::Default',

    TICKET_PLACEHOLDER_BODYRICHTEXT_LINECOUNT = 'Ticket::Placeholder::BodyRichtext::DefaultLineCount',

    USER_PASSWORD_RESET_ENABLED = 'User::Password::Reset::Enabled'

}
