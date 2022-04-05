/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { LinkedObjectsWidgetConfiguration } from '../../model/configuration/LinkedObjectsWidgetConfiguration';
import { ObjectInformationWidgetConfiguration } from '../../model/configuration/ObjectInformationWidgetConfiguration';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { WidgetSize } from '../../model/configuration/WidgetSize';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import {
    InformationConfiguration,
    InformationRowConfiguration,
    ObjectInformationCardConfiguration
} from '../base-components/webapp/components/object-information-card-widget/ObjectInformationCardConfiguration';
import { ConfigItemProperty } from './model/ConfigItemProperty';
import { VersionProperty } from './model/VersionProperty';
import { ConfigItemDetailsContext } from './webapp/core/context/ConfigItemDetailsContext';

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
            new ObjectInformationCardConfiguration(
                [],
                [
                    new InformationRowConfiguration(
                        [
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ConfigItemProperty.CLASS_ID
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ConfigItemProperty.NAME
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ConfigItemProperty.CUR_DEPL_STATE_ID
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ConfigItemProperty.CUR_INCI_STATE_ID
                                    }
                                )
                            ]
                        ], null, null, true
                    ),
                    new InformationRowConfiguration(
                        [
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ConfigItemProperty.CREATE_TIME
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ConfigItemProperty.CREATE_BY
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ConfigItemProperty.CHANGE_TIME
                                    }
                                )
                            ],
                            [
                                new InformationConfiguration(
                                    'object-avatar-label',
                                    {
                                        property: ConfigItemProperty.CHANGE_BY
                                    }
                                )
                            ]
                        ], null, null, false
                    )
                ]
            ),
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
            'config-item-history-widget', 'Translatable#History', [],
            new ConfigurationDefinition('config-item-history-config', ConfigurationType.Table),
            null, false, false, null, false
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
            ['config-item-version-compare-action', 'config-item-print-selection-action'],
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
                    'config-item-create-action', 'config-item-create-graph-action'
                ],
                [
                    'config-item-edit-action', 'config-item-duplicate-action',
                    'ticket-create-action', 'linked-objects-edit-action', 'config-item-print-action'
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

        configurations.push(
            new ObjectInformationWidgetConfiguration(
                'config-item-details-print-config',
                'Asset Print Configuration',
                ConfigurationType.ObjectInformation,
                KIXObjectType.CONFIG_ITEM,
                [
                    ConfigItemProperty.CHANGE_BY,
                    ConfigItemProperty.CHANGE_TIME,
                    ConfigItemProperty.CLASS,
                    ConfigItemProperty.CONFIG_ITEM_ID,
                    ConfigItemProperty.CREATE_BY,
                    ConfigItemProperty.CREATE_TIME,
                    ConfigItemProperty.CUR_DEPL_STATE_ID,
                    ConfigItemProperty.CUR_INCI_STATE_ID,
                    ConfigItemProperty.NUMBER
                ]
            )
        );

        configurations.push(
            new ObjectInformationWidgetConfiguration(
                'config-item-version-details-print-config',
                'Asset Version Print Configuration',
                ConfigurationType.ObjectInformation,
                KIXObjectType.CONFIG_ITEM_VERSION,
                [
                    VersionProperty.CLASS,
                    VersionProperty.CONFIG_ITEM_ID,
                    VersionProperty.COUNT_NUMBER,
                    VersionProperty.CREATE_BY,
                    VersionProperty.CREATE_TIME,
                    VersionProperty.CUR_DEPL_STATE_ID,
                    VersionProperty.CUR_INCI_STATE_ID,
                    VersionProperty.NUMBER,
                    VersionProperty.VERSION_ID,
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
