/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from "../../core/extensions";
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration,
    KIXObjectType, CRUD, TabWidgetConfiguration, LinkedObjectsWidgetConfiguration
} from "../../core/model";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";
import { FAQDetailsContext } from "../../core/browser/faq/context/FAQDetailsContext";
import { ConfigurationType, ConfigurationDefinition, IConfiguration } from "../../core/model/configuration";
import { ModuleConfigurationService } from "../../services";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const faqInfoWidget = new WidgetConfiguration(
            'faq-article-info-widget', 'FAQ Article Info', ConfigurationType.Widget,
            'faq-article-info-widget', 'Translatable#FAQ Information',
            [], null, null, false, true, null, false
        );
        configurations.push(faqInfoWidget);

        const tabWidgetConfig = new TabWidgetConfiguration(
            'faq-article-info-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['faq-article-info-widget']
        );
        configurations.push(tabWidgetConfig);

        const tabLane = new WidgetConfiguration(
            'faq-article-info-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('faq-article-info-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabLane);

        const linkedObjectConfig = new LinkedObjectsWidgetConfiguration(
            'faq-article-linked-objects-config', 'Linked Objects', ConfigurationType.LinkedObjects,
            [
                ["Tickets", KIXObjectType.TICKET],
                ["FAQs", KIXObjectType.FAQ_ARTICLE],
                ["Config Items", KIXObjectType.CONFIG_ITEM]
            ]
        );
        configurations.push(linkedObjectConfig);

        const faqLinkedObjectsLane = new WidgetConfiguration(
            'faq-article-linked-objects-widget', 'Linked Objects', ConfigurationType.Widget,
            'linked-objects-widget', 'Translatable#Linked Objects',
            ['linked-objects-edit-action'],
            new ConfigurationDefinition('faq-article-linked-objects-config', ConfigurationType.LinkedObjects),
            null, true, true, null, false
        );
        configurations.push(faqLinkedObjectsLane);

        const faqHistoryLane = new WidgetConfiguration(
            'faq-article-history-widget', 'History Widget', ConfigurationType.Widget,
            'faq-article-history-widget', 'Translatable#History', [], null, null,
            true, true, null, false
        );
        configurations.push(faqHistoryLane);

        const faqArticleWidget = new WidgetConfiguration(
            'faq-article-content-widget', 'FAQ Article Content', ConfigurationType.Widget,
            'faq-article-content-widget', 'Translatable#FAQ Article',
            ['faq-article-vote-action', 'faq-article-edit-action'],
            null, null, false, true, null, false
        );
        configurations.push(faqArticleWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(),
                [], [],
                [
                    new ConfiguredWidget('faq-article-info-tab-widget', 'faq-article-info-tab-widget'),
                    new ConfiguredWidget(
                        'faq-article-linked-objects-widget', 'faq-article-linked-objects-widget', null,
                        [new UIComponentPermission('links', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'faq-article-history-widget', 'faq-article-history-widget', null,
                        [new UIComponentPermission('faq/articles/*/history', [CRUD.READ])]
                    )
                ],
                [
                    new ConfiguredWidget('faq-article-content-widget', 'faq-article-content-widget')
                ],
                [
                    'faq-article-create-action'
                ],
                [
                    'linked-objects-edit-action', 'faq-article-edit-action', 'print-action'
                ],
                [],
                [
                    new ConfiguredWidget('faq-article-info-widget', 'faq-article-info-widget')
                ]

            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
