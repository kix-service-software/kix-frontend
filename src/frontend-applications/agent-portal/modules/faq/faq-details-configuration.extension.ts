/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FAQDetailsContext } from './webapp/core/context/FAQDetailsContext';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { LinkedObjectsWidgetConfiguration } from '../../model/configuration/LinkedObjectsWidgetConfiguration';

import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { FAQArticleProperty } from './model/FAQArticleProperty';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { SearchOperator } from '../search/model/SearchOperator';
import { ObjectInformationCardConfiguration } from '../base-components/webapp/components/object-information-card-widget/ObjectInformationCardConfiguration';
import { UIFilterCriterion } from '../../model/UIFilterCriterion';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const faqInfoWidget = new WidgetConfiguration(
            'faq-article-info-widget', 'FAQ Article Info', ConfigurationType.Widget,
            'object-information-card-widget', 'Translatable#FAQ Information',
            [], null,
            new ObjectInformationCardConfiguration(
                [],
                [
                    {
                        style: '',
                        separator: true,
                        roleIds: [],
                        values: [
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: FAQArticleProperty.CATEGORY_ID
                                    },
                                    roleIds: []
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: FAQArticleProperty.CUSTOMER_VISIBLE
                                    },
                                    roleIds: []
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: KIXObjectProperty.VALID_ID
                                    },
                                    roleIds: []
                                }
                            ]
                        ]
                    },
                    {
                        style: '',
                        separator: true,
                        roleIds: [],
                        values: [
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: FAQArticleProperty.CREATED
                                    },
                                    roleIds: []
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: FAQArticleProperty.CREATED_BY
                                    },
                                    roleIds: []
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: FAQArticleProperty.CHANGED
                                    },
                                    roleIds: []
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: FAQArticleProperty.CHANGED_BY
                                    },
                                    roleIds: []
                                }
                            ]
                        ]
                    },
                    {
                        title: 'Translatable#References',
                        style: '',
                        separator: false,
                        roleIds: [],
                        values: [
                            [
                                {
                                    text: 'Translatable#Related Assets',
                                    textStyle: 'font-weight:bold;margin-bottom:0.5rem',
                                    detailViewWidthFactor: '1',
                                    icon: 'kix-icon-ci',
                                    componentId: 'dynamic-field-value',
                                    componentData: {
                                        name: 'RelatedAssets'
                                    },
                                    conditions: [
                                        new UIFilterCriterion(
                                            'DynamicFields.RelatedAssets',
                                            SearchOperator.NOT_EQUALS,
                                            null
                                        )
                                    ],
                                    roleIds: []
                                }
                            ]
                        ]
                    }
                ]
            ), false, true, null, false
        );
        configurations.push(faqInfoWidget);

        const linkedObjectConfig = new LinkedObjectsWidgetConfiguration(
            'faq-article-linked-objects-config', 'Linked Objects', ConfigurationType.LinkedObjects, []
        );
        configurations.push(linkedObjectConfig);

        const faqLinkedObjectsLane = new WidgetConfiguration(
            'faq-article-linked-objects-widget', 'Linked Objects', ConfigurationType.Widget,
            'linked-objects-widget', 'Translatable#Linked Objects (<KIX_OBJECT_LinkCount>)', [],
            new ConfigurationDefinition('faq-article-linked-objects-config', ConfigurationType.LinkedObjects),
            null, false, false, null, false
        );
        configurations.push(faqLinkedObjectsLane);

        const faqHistoryWidget = new WidgetConfiguration(
            'faq-article-history-widget', 'History Widget', ConfigurationType.Widget,
            'faq-article-history-widget', 'Translatable#History', [],
            new ConfigurationDefinition('faq-article-history-config', ConfigurationType.Table), null,
            false, false, null, false
        );
        configurations.push(faqHistoryWidget);

        const tabWidgetConfig = new TabWidgetConfiguration(
            'faq-article-info-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            [
                'faq-article-info-widget',
                'faq-article-linked-objects-widget',
                'faq-article-history-widget'
            ]
        );
        configurations.push(tabWidgetConfig);

        const tabLane = new WidgetConfiguration(
            'faq-article-info-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('faq-article-info-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabLane);

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
                    new ConfiguredWidget('faq-article-info-tab-widget', 'faq-article-info-tab-widget')
                ],
                [
                    new ConfiguredWidget('faq-article-content-widget', 'faq-article-content-widget')
                ],
                [
                    'faq-article-create-action'
                ],
                [
                    'linked-objects-edit-action', 'faq-article-edit-action'
                ],
                [],
                [
                    new ConfiguredWidget('faq-article-info-widget', 'faq-article-info-widget'),
                    new ConfiguredWidget(
                        'faq-article-linked-objects-widget', 'faq-article-linked-objects-widget', null,
                        [new UIComponentPermission('links', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'faq-article-history-widget', 'faq-article-history-widget', null
                    )
                ]

            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
