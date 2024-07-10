/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class ArticleFilter {

    public constructor(
        public filterAttachments?: boolean,
        public filterExternal?: boolean,
        public filterInternal?: boolean,
        public filterCustomer?: boolean,
        public filterUnread?: boolean,
        public filterMyArticles?: boolean,
        public fulltext?: string,
        public filterDateBefore?: boolean,
        public filterDate?: string
    ) { }
}