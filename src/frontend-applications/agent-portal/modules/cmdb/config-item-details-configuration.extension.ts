/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { ConfigItemDetailsContext } from './webapp/core/context/ConfigItemDetailsContext';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { LinkedObjectsWidgetConfiguration } from '../../model/configuration/LinkedObjectsWidgetConfiguration';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { WidgetSize } from '../../model/configuration/WidgetSize';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ConfigItemProperty } from './model/ConfigItemProperty';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ConfigItemDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const configItemInfoLaneTab = new WidgetConfiguration(
            'config-item-details-object-info', 'Object Info', ConfigurationType.Widget,
            'object-information-card-widget', 'Translatable#Config Item Information', [],
            null,
            {
                avatar: [],
                rows: [
                    {
                        style: '',
                        separator: true,
                        values: [
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: ConfigItemProperty.CLASS_ID
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: ConfigItemProperty.NAME
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: ConfigItemProperty.CUR_DEPL_STATE_ID
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: ConfigItemProperty.CUR_INCI_STATE_ID
                                    }
                                }
                            ]
                        ]
                    },
                    {
                        style: '',
                        separator: false,
                        values: [
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: ConfigItemProperty.CREATE_TIME
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: ConfigItemProperty.CREATE_BY
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: ConfigItemProperty.CHANGE_TIME
                                    }
                                }
                            ],
                            [
                                {
                                    componentId: 'object-avatar-label',
                                    componentData: {
                                        property: ConfigItemProperty.CHANGE_BY
                                    }
                                }
                            ]
                        ]
                    }
                ]
            },
            false, true, null, false
        );
        configurations.push(configItemInfoLaneTab);

        const linkedObjectsConfig = new LinkedObjectsWidgetConfiguration(
            'config-item-details-linked-objects-config', 'Linked Objects Config', ConfigurationType.LinkedObjects, []
        );
        configurations.push(linkedObjectsConfig);

        const configItemLinkedObjectsWidget = new WidgetConfiguration(
            'config-item-details-linked-object-widget', 'Linked Objects', ConfigurationType.Widget,
            'linked-objects-widget', 'Translatable#Linked Objects',
            [],
            new ConfigurationDefinition('config-item-details-linked-objects-config', ConfigurationType.LinkedObjects),
            null, false, false, null, false
        );
        configurations.push(configItemLinkedObjectsWidget);

        const configItemHistoryWidget = new WidgetConfiguration(
            'config-item-details-history-widget', 'History', ConfigurationType.Widget,
            'config-item-history-widget', 'Translatable#History', [], null,
            new ConfigurationDefinition('config-item-history-config', ConfigurationType.Table),
            false, false, null, false
        );
        configurations.push(configItemHistoryWidget);

        const tabConfig = new TabWidgetConfiguration(
            'config-item-details-object-info-tab-config', 'Tab Config', ConfigurationType.TabWidget,
            [
                'config-item-details-object-info',
                'config-item-details-linked-object-widget',
                'config-item-details-history-widget'
            ]
        );
        configurations.push(tabConfig);

        const tabLane = new WidgetConfiguration(
            'config-item-details-object-info-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('config-item-details-object-info-tab-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabLane);

        const widgetConfig = new TableWidgetConfiguration(
            'config-item-details-version-list-table-widget', 'Table Widget', ConfigurationType.TableWidget,
            KIXObjectType.CONFIG_ITEM_VERSION
        );
        configurations.push(widgetConfig);

        const configItemVersionLane = new WidgetConfiguration(
            'config-item-details-version-widget', 'Version Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Overview Versions',
            ['config-item-version-compare-action'],
            new ConfigurationDefinition('config-item-details-version-list-table-widget', ConfigurationType.TableWidget),
            null, false, true, WidgetSize.BOTH, true
        );
        configurations.push(configItemVersionLane);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Config Item Details', ConfigurationType.Context,
                this.getModuleId(),
                [], [],
                [
                    new ConfiguredWidget(
                        'config-item-details-object-info-tab-widget', 'config-item-details-object-info-tab-widget',
                        null, [new UIComponentPermission('cmdb/configitems', [CRUD.READ])]
                    )
                ],
                [
                    new ConfiguredWidget(
                        'config-item-details-version-widget', 'config-item-details-version-widget', null
                    )
                ],
                [
                    'config-item-create-action'
                ],
                [
                    'config-item-edit-action', 'config-item-duplicate-action',
                    'ticket-create-action', 'linked-objects-edit-action'
                ],
                [],
                [
                    new ConfiguredWidget('config-item-details-object-info', 'config-item-details-object-info'),
                    new ConfiguredWidget(
                        'config-item-details-linked-object-widget', 'config-item-details-linked-object-widget', null,
                        [new UIComponentPermission('links', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'config-item-details-history-widget', 'config-item-details-history-widget', null
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

module.exports = (data, host, options) => {
    return new Extension();
};
