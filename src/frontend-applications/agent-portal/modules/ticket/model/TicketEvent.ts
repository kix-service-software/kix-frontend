/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum TicketEvent {

    REMOVE_ARTICLE_SEEN_FLAG = 'REMOVE_ARTICLE_SEEN_FLAG',
    REMOVE_ARTICLE_SEEN_FLAG_DONE = 'REMOVE_ARTICLE_SEEN_FLAG_DONE',

    LOAD_ARTICLE_ATTACHMENT = 'LOAD_ARTICLE_ATTACHMENT',
    ARTICLE_ATTACHMENT_LOADED = 'ARTICLE_ATTACHMENT_LOADED',

    LOAD_ARTICLE_ZIP_ATTACHMENT = 'LOAD_ARTICLE_ZIP_ATTACHMENT',
    ARTICLE_ZIP_ATTACHMENT_LOADED = 'ARTICLE_ZIP_ATTACHMENT_LOADED'

}
