/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FAQContext } from './webapp/core/context/FAQContext';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { TableHeaderHeight } from '../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../model/configuration/TableRowHeight';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { SearchProperty } from '../search/model/SearchProperty';
import { FAQArticleProperty } from './model/FAQArticleProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { FAQCategoryProperty } from './model/FAQCategoryProperty';
import { SearchOperator } from '../search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';
import { KIXExtension } from '../../../../server/model/KIXExtension';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const tableConfig = new TableConfiguration(
            'faq-dashboard-article-table', 'FAQ Article Table', ConfigurationType.Table,
            KIXObjectType.FAQ_ARTICLE, null,
            null, null, null, true, null, null, null,
            TableHeaderHeight.LARGE, TableRowHeight.LARGE
        );
        configurations.push(tableConfig);

        const tableWidget = new TableWidgetConfiguration(
            'faq-dashboard-article-table-widget', 'FAQ Article Table Widget', ConfigurationType.TableWidget,
            KIXObjectType.FAQ_ARTICLE, null,
            new ConfigurationDefinition('faq-dashboard-article-table', ConfigurationType.Table)
        );
        configurations.push(tableWidget);

        const articleListWidget = new WidgetConfiguration(
            'faq-dashboard-article-widget', 'FAQ Article Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Overview FAQ', ['csv-export-action'],
            new ConfigurationDefinition('faq-dashboard-article-table-widget', ConfigurationType.TableWidget), null,
            false, false, 'kix-icon-faq', true
        );
        configurations.push(articleListWidget);

        const faqCategoryExplorer = new WidgetConfiguration(
            'faq-dashboard-category-explorer', 'Category Explorer', ConfigurationType.Widget,
            'faq-category-explorer', 'Translatable#FAQ Categories', [], null, null,
            false, true, 'kix-icon-faq', false
        );
        configurations.push(faqCategoryExplorer);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(),
                [],
                [
                    new ConfiguredWidget(
                        'faq-dashboard-category-explorer', 'faq-dashboard-category-explorer', null,
                        [new UIComponentPermission('system/faq/categories', [CRUD.READ])]
                    )
                ],
                [],
                [
                    new ConfiguredWidget(
                        'faq-dashboard-article-widget', 'faq-dashboard-article-widget', null,
                        [new UIComponentPermission('faq/articles', [CRUD.READ])]
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const linkFormId = 'faq-article-link-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-link-form-field-fulltext',
                'Translatable#Full Text', SearchProperty.FULLTEXT, null, false,
                'Translatable#Helptext_FAQ_Link_FullText'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-link-form-field-number',
                'Translatable#FAQ#', FAQArticleProperty.NUMBER, null, false, 'Translatable#Helptext_FAQ_Link_Number'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-link-form-field-title',
                'Translatable#Title', FAQArticleProperty.TITLE, null, false, 'Translatable#Helptext_FAQ_Link_Title'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-link-form-field-category',
                'Category', FAQArticleProperty.CATEGORY_ID, 'object-reference-input', false,
                'Translatable#Helptext_FAQ_Link_Category',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.FAQ_CATEGORY),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    FAQCategoryProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, null
                                )
                            ],
                            null, null,
                            [FAQCategoryProperty.SUB_CATEGORIES],
                            [FAQCategoryProperty.SUB_CATEGORIES]
                        )
                    )
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-link-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', false, 'Translatable#Helptext_FAQ_Link_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ],
                new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'faq-article-link-form-group-attributes',
                'Translatable#FAQ Attributes',
                [
                    'faq-article-link-form-field-fulltext',
                    'faq-article-link-form-field-number',
                    'faq-article-link-form-field-title',
                    'faq-article-link-form-field-category',
                    'faq-article-link-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'faq-article-link-form-page', 'Translatable#Link FAQ with',
                ['faq-article-link-form-group-attributes']
            )
        );

        configurations.push(
            new FormConfiguration(
                linkFormId, 'Translatable#Link FAQ with',
                ['faq-article-link-form-page'],
                KIXObjectType.FAQ_ARTICLE, false, FormContext.LINK
            )
        );

        ModuleConfigurationService.getInstance().registerForm(
            [FormContext.LINK], KIXObjectType.FAQ_ARTICLE, linkFormId
        );

        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
