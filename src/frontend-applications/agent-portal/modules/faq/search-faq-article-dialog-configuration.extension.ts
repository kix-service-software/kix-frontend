/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQArticleSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const tableConfig = new TableConfiguration(
            'faq-search-article-table', 'FAQ Article Search Table', ConfigurationType.Table, KIXObjectType.FAQ_ARTICLE
        );

        const tableWidget = new TableWidgetConfiguration(
            'faq-search-article-table-widget', 'FAQ Article Search Table Widget', ConfigurationType.TableWidget,
            KIXObjectType.FAQ_ARTICLE, null, null, tableConfig
        );

        const articleListWidget = new WidgetConfiguration(
            'faq-search-article-widget', 'FAQ Article Search Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Search Results: FAQ', ['csv-export-action'],
            null, tableWidget, false, false, 'kix-icon-faq', true
        );

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'FAQ Search', ConfigurationType.Context, this.getModuleId(),
                [], [], [],
                [
                    new ConfiguredWidget('faq-search-article-widget', null, articleListWidget)
                ]
            )
        );

        return configurations;
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

module.exports = (data, host, options): Extension => {
    return new Extension();
};
