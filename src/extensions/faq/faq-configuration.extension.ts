/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration,
    FormContext, KIXObjectType,
    TableWidgetConfiguration, CRUD, KIXObjectProperty, ObjectReferenceOptions, FormFieldOption, FormFieldValue,
    FilterDataType, FilterType, FilterCriteria, KIXObjectLoadingOptions
} from '../../core/model';
import {
    SearchProperty, TableConfiguration, TableHeaderHeight, TableRowHeight, SearchOperator
} from '../../core/browser';
import { FAQArticleProperty, FAQCategoryProperty } from '../../core/model/kix/faq';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService } from '../../core/services';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { FAQContext } from '../../core/browser/faq/context/FAQContext';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class DashboardModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const tableConfig = new TableConfiguration(
            'faq-dashboard-article-table', 'FAQ Article Table', ConfigurationType.Table,
            KIXObjectType.FAQ_ARTICLE, null,
            null, null, null, true, null, null, null,
            TableHeaderHeight.LARGE, TableRowHeight.LARGE
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tableConfig);

        const tableWidget = new TableWidgetConfiguration(
            'faq-dashboard-article-table-widget', 'FAQ Article Table Widget', ConfigurationType.TableWidget,
            KIXObjectType.FAQ_ARTICLE, null,
            new ConfigurationDefinition('faq-dashboard-article-table', ConfigurationType.Table)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tableWidget);

        const articleListWidget = new WidgetConfiguration(
            'faq-dashboard-article-widget', 'FAQ Article Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Overview FAQ', ['faq-article-create-action', 'csv-export-action'],
            new ConfigurationDefinition('faq-dashboard-article-table-widget', ConfigurationType.TableWidget), null,
            false, false, 'kix-icon-faq', true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(articleListWidget);

        const faqCategoryExplorer = new WidgetConfiguration(
            'faq-dashboard-category-explorer', 'Category Explorer', ConfigurationType.Widget,
            'faq-category-explorer', 'Translatable#FAQ Categories', [], null, null,
            false, false, 'kix-icon-faq', false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(faqCategoryExplorer);

        const notesSidebar = new WidgetConfiguration(
            'faq-dashboard-notes-widget', 'Notes Widget', ConfigurationType.Widget,
            'notes-widget', 'Translatable#Notes', [], null, null,
            false, false, 'kix-icon-note', false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(notesSidebar);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [
                new ConfiguredWidget('faq-dashboard-notes-widget', 'faq-dashboard-notes-widget')
            ],
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
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const linkFormId = 'faq-article-link-form';
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-link-form-field-fulltext',
                "Translatable#Full Text", SearchProperty.FULLTEXT, null, false,
                "Translatable#Helptext_FAQ_Link_FullText"
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-link-form-field-number',
                "Translatable#FAQ#", FAQArticleProperty.NUMBER, null, false, "Translatable#Helptext_FAQ_Link_Number"
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-link-form-field-title',
                'Translatable#Title', FAQArticleProperty.TITLE, null, false, "Translatable#Helptext_FAQ_Link_Title"
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-link-form-field-category',
                "Category", FAQArticleProperty.CATEGORY_ID, 'object-reference-input', false,
                "Translatable#Helptext_FAQ_Link_Category",
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.FAQ_CATEGORY),
                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, true),
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
        await ModuleConfigurationService.getInstance().saveConfiguration(
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'faq-article-link-form-page', 'Translatable#Link FAQ with',
                ['faq-article-link-form-group-attributes']
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                linkFormId, 'Translatable#Link FAQ with',
                ['faq-article-link-form-page'],
                KIXObjectType.FAQ_ARTICLE, false, FormContext.LINK
            )
        );

        ConfigurationService.getInstance().registerForm(
            [FormContext.LINK], KIXObjectType.FAQ_ARTICLE, linkFormId
        );
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
