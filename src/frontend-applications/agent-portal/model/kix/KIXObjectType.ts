/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum KIXObjectType {

    ANY = 'ANY',

    ATTACHMENT = 'ATTACHMENT',

    ARTICLE = 'Article',

    CHANNEL = 'Channel',

    CONSOLE_COMMAND = 'ConsoleCommand',

    SENDER_TYPE = 'SENDER_TYPE',

    LOCK = 'LOCK',

    CLIENT_REGISTRATION = 'CLIENT_REGISTRATION',

    CONFIG_ITEM = 'ConfigItem',

    CONFIG_ITEM_VERSION = 'ConfigItemVersion',

    CONFIG_ITEM_CLASS = 'Class',

    CONFIG_ITEM_CLASS_DEFINITION = 'Definition',

    CONFIG_ITEM_IMAGE = 'CONFIG_ITEM_IMAGE',

    CONFIG_ITEM_HISTORY = 'CONFIG_ITEM_HISTORY',

    CONFIG_ITEM_ATTACHMENT = 'CONFIG_ITEM_ATTACHMENT',

    CONFIG_ITEM_VERSION_COMPARE = 'CONFIG_ITEM_VERSION_COMPARE',

    CONTACT = 'Contact',

    CURRENT_USER = 'CURRENT_USER',

    ORGANISATION = 'Organisation',

    DYNAMIC_FIELD = 'DynamicField',

    EXEC_PLAN = 'ExecPlan',

    EXEC_PLAN_TYPE = 'ExecPlanType',

    FAQ_ARTICLE = 'FAQArticle',

    FAQ_ARTICLE_ATTACHMENT = 'Attachment',

    FAQ_ARTICLE_HISTORY = 'FAQHistory',

    FAQ_CATEGORY = 'FAQCategory',

    FAQ_VOTE = 'FAQVote',

    FAQ_VISIBILITY = 'FAQVisibility',

    FAQ_KEYWORD = 'FAQKeyword',

    GENERAL_CATALOG_ITEM = 'GeneralCatalogItem',

    GENERAL_CATALOG_CLASS = 'GeneralCatalogClass',

    IMPORT_EXPORT_TEMPLATE = 'ImportExportTemplate',

    JOB = 'Job',

    JOB_FILTER = 'JOB_FILTER',

    LINK = 'Link',

    LINK_OBJECT = 'LINK_OBJECT',

    LINK_TYPE = 'LINK_TYPE',

    LOG_FILE = 'LogFile',

    MACRO = 'Macro',

    MACRO_ACTION = 'MacroAction',

    MACRO_ACTION_TYPE = 'MacroActionType',

    MAIL_ACCOUNT = 'MailAccount',

    MAIL_ACCOUNT_TYPE = 'MailAccountType',

    MAIL_FILTER = 'MailFilter',

    MAIL_FILTER_MATCH = 'MAIL_FILTER_MATCH',

    MAIL_FILTER_SET = 'MAIL_FILTER_SET',

    NOTIFICATION = 'Notification',

    NOTIFICATION_FILTER = 'NOTIFICATION_FILTER',

    OBJECT_ICON = 'OBJECT_ICON',

    OBJECT_DEFINITION = 'ObjectDefinition',

    QUEUE = 'Queue',

    ROLE = 'Role',

    SERVICE = 'Service',

    SLA = 'SLA',

    SYS_CONFIG_OPTION = 'SysConfigOption',

    SYS_CONFIG_OPTION_DEFINITION = 'SysConfigOptionDefinition',

    SYSTEM_ADDRESS = 'SystemAddress',

    TEXT_MODULE = "TextModule",

    TICKET = 'Ticket',

    TICKET_HISTORY = 'History',

    TICKET_PRIORITY = 'Priority',

    TICKET_TYPE = 'TicketType',

    TICKET_STATE = 'TicketState',

    TICKET_STATE_TYPE = 'StateType',

    TICKET_TEMPLATE = 'TICKET_TEMPLATE',

    TRANSLATION = 'Translation',

    TRANSLATION_PATTERN = 'TranslationPattern',

    TRANSLATION_LANGUAGE = 'TranslationLanguage',

    USER = 'User',

    USER_PREFERENCE = 'UserPreference',

    VALID_OBJECT = 'ValidObject',

    WATCHER = 'Watcher',

    PERSONAL_SETTINGS = 'PERSONAL_SETTINGS',

    IMPORT_OBJECT = 'IMPORT_OBJECT',

    PERMISSION = 'Permission',

    PERMISSION_TYPE = 'PermissionType',

    PERMISSION_DEPENDING_OBJECTS = 'PERMISSION_DEPENDING_OBJECTS',

    ROLE_PERMISSION = 'ROLE_PERMISSION',

    FOLLOW_UP_TYPE = 'FollowUpType',

    WEBFORM = 'WEBFORM'
}