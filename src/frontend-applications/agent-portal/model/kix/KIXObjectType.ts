/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum KIXObjectType {

    ANY = 'ANY',

    ATTACHMENT = 'Attachment',

    ARTICLE = 'Article',

    CHANNEL = 'Channel',

    CONSOLE_COMMAND = 'ConsoleCommand',

    SENDER_TYPE = 'SENDER_TYPE',

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

    DYNAMIC_FIELD_TYPE = 'DynamicFieldType',

    EXEC_PLAN = 'ExecPlan',

    EXEC_PLAN_TYPE = 'ExecPlanType',

    FAQ_ARTICLE = 'FAQArticle',

    FAQ_ARTICLE_ATTACHMENT = 'Attachment',

    FAQ_ARTICLE_HISTORY = 'FAQHistory',

    FAQ_CATEGORY = 'FAQCategory',

    FAQ_VOTE = 'FAQVote',

    FAQ_KEYWORD = 'FAQKeyword',

    GENERAL_CATALOG_ITEM = 'GeneralCatalogItem',

    GENERAL_CATALOG_CLASS = 'GeneralCatalogClass',

    GRAPH = 'Graph',

    GRAPH_INSTANCE = 'GraphInstance',

    HTML_TO_PDF = 'HTMLToPDF',

    HTML_TO_PDF_TEMPLATE = 'HTMLToPDFTemplate',

    IMPORT_EXPORT_TEMPLATE = 'ImportExportTemplate',

    IMPORT_EXPORT_TEMPLATE_RUN = 'ImportExportTemplateRun',

    JOB = 'Job',

    JOB_TYPE = 'JobType',

    JOB_FILTER = 'JOB_FILTER',

    JOB_RUN = 'JobRun',

    JOB_RUN_LOG = 'JobRunLog',

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

    OAUTH2_PROFILE = 'OAuth2Profile',

    OAUTH2_PROFILE_AUTH = 'OAuth2ProfileAuth',

    OAUTH2_PROFILE_AUTH_URL = 'OAUTH2_PROFILE_AUTH_URL',

    QUEUE = 'Queue',

    PLUGIN = 'Plugin',

    PLUGIN_ACTION = 'PluginAction',

    PLUGIN_README = 'PluginReadme',

    REPORT = 'Report',

    REPORT_DEFINITION = 'ReportDefinition',

    REPORT_OUTPUT_FORMAT = 'OutputFormat',

    REPORT_RESULT = 'ReportResult',

    REPORT_DATA_SOURCE = 'ReportDataSource',

    ROLE = 'Role',

    SYS_CONFIG_OPTION = 'SysConfigOption',

    SYS_CONFIG_OPTION_DEFINITION = 'SysConfigOptionDefinition',

    SYSTEM_ADDRESS = 'SystemAddress',

    TEXT_MODULE = 'TextModule',

    TICKET = 'Ticket',

    TICKET_LOCK = 'Lock',

    TICKET_HISTORY = 'History',

    TICKET_PRIORITY = 'Priority',

    TICKET_TYPE = 'TicketType',

    TICKET_STATE = 'TicketState',

    TICKET_STATE_TYPE = 'StateType',

    TRANSLATION = 'Translation',

    TRANSLATION_PATTERN = 'TranslationPattern',

    TRANSLATION_LANGUAGE = 'TranslationLanguage',

    USER = 'User',

    USER_SESSION = 'Session',

    USER_PREFERENCE = 'UserPreference',

    VALID_OBJECT = 'ValidObject',

    WATCHER = 'Watcher',

    PERSONAL_SETTINGS = 'PERSONAL_SETTINGS',

    IMPORT_OBJECT = 'IMPORT_OBJECT',

    PERMISSION = 'Permission',

    PERMISSION_TYPE = 'PermissionType',

    ROLE_PERMISSION = 'ROLE_PERMISSION',

    FOLLOW_UP_TYPE = 'FollowUpType',

    WEBFORM = 'WEBFORM',

    CONTEXT = 'CONTEXT'
}
