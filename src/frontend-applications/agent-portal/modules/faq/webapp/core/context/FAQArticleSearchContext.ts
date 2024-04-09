/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { SearchContext } from '../../../../search/webapp/core';
import { FAQArticleProperty } from '../../../model/FAQArticleProperty';

export class FAQArticleSearchContext extends SearchContext {

    public static CONTEXT_ID: string = 'search-faq-article-context';

    public getIcon(): string | ObjectIcon {
        return 'kix-icon-search-faq';
    }

    public getAdditionalInformation(key: string): any {
        if (key === AdditionalContextInformation.OBJECT_DEPENDENCY) {
            const criterion = this.searchCache?.criteria?.find(
                (c) => c.property === FAQArticleProperty.CATEGORY_ID
            );
            return criterion?.value || [];
        }

        return super.getAdditionalInformation(key);
    }

}
