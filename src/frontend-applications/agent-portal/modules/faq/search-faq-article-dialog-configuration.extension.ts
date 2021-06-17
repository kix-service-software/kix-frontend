/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { FAQArticleSearchContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { SearchForm } from '../../modules/base-components/webapp/core/SearchForm';
import { FormContext } from '../../model/configuration/FormContext';
import { SearchProperty } from '../search/model/SearchProperty';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FAQArticleProperty } from './model/FAQArticleProperty';
import { ModuleConfigurationService } from '../../server/services/configuration';
import { SearchExtension } from '../search/SearchExtension';

export class Extension extends SearchExtension {

    public getModuleId(): string {
        return FAQArticleSearchContext.CONTEXT_ID;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'faq-article-search-form';
        const configurations = [];
        configurations.push(
            new SearchForm(
                formId, 'FAQ-Artikel', KIXObjectType.FAQ_ARTICLE, FormContext.SEARCH,
                null,
                [
                    SearchProperty.FULLTEXT,
                    FAQArticleProperty.TITLE, FAQArticleProperty.CATEGORY_ID,
                    KIXObjectProperty.VALID_ID
                ]
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.SEARCH], KIXObjectType.FAQ_ARTICLE, formId);

        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
