/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { FAQArticle } from '../../../model/FAQArticle';
import { Table } from '../../../../table/model/Table';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { TableValue } from '../../../../table/model/TableValue';
import { FAQArticleProperty } from '../../../model/FAQArticleProperty';

export class FAQArticleTableContentProvider extends TableContentProvider<FAQArticle> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string,
        objects?: KIXObject[]
    ) {
        super(KIXObjectType.FAQ_ARTICLE, table, objectIds, loadingOptions, contextId, objects);
    }

    protected async prepareSpecificValues(values: TableValue[], faqArticle: FAQArticle): Promise<void> {
        await super.prepareSpecificValues(values, faqArticle);

        // create a new dom element to get "plain text" of the html attributes
        const tempElement = document.createElement('div');

        for (const value of values) {
            if (
                value.property === FAQArticleProperty.FIELD_1 ||
                value.property === FAQArticleProperty.FIELD_2 ||
                value.property === FAQArticleProperty.FIELD_3 ||
                value.property === FAQArticleProperty.FIELD_4 ||
                value.property === FAQArticleProperty.FIELD_5 ||
                value.property === FAQArticleProperty.FIELD_6
            ) {
                // set the HTML content
                tempElement.innerHTML = value.objectValue;
                // get the text
                value.displayValue = tempElement.textContent || tempElement.innerText;
            }
        }
    }
}
