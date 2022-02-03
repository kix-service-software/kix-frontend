/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableValue } from '../../../../table/model/TableValue';
import { ITableCSSHandler } from '../../../../table/webapp/core/css-handler/ITableCSSHandler';
import { Article } from '../../../model/Article';
import { ArticleProperty } from '../../../model/ArticleProperty';

export class ArticleTableCSSHandler implements ITableCSSHandler<Article> {

    public async getRowCSSClasses(article: Article): Promise<string[]> {
        const classes = [];

        if (article?.isUnread()) {
            classes.push('article-unread');
        }

        return classes;
    }

    public async getValueCSSClasses(article: Article, value: TableValue): Promise<string[]> {
        const classes = [];
        switch (value.property) {
            case ArticleProperty.ARTICLE_INFORMATION:
                classes.push('unseen');
                break;
            default:
        }
        return classes;
    }

}
