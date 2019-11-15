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
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize, KIXObjectType, CRUD,
    TableWidgetConfiguration,
    TabWidgetConfiguration,
    LinkedObjectsWidgetConfiguration,
} from "../../core/model";
import { ConfigItemDetailsContext } from "../../core/browser/cmdb";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";
import { ConfigurationType, ConfigurationDefinition, IConfiguration } from "../../core/model/configuration";
import { ModuleConfigurationService } from "../../services";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return ConfigItemDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const configItemInfoLaneTab = new WidgetConfiguration(
            'config-item-details-object-info', 'Object Info', ConfigurationType.Widget,
            'config-item-info-widget', 'Translatable#Config Item Information', [],
            null, null, false, true, null, false
        );
        configurations.push(configItemInfoLaneTab);

        const tabConfig = new TabWidgetConfiguration(
            'config-item-details-object-info-tab-config', 'Tab Config', ConfigurationType.TabWidget,
            ['config-item-details-object-info']
        );
        configurations.push(tabConfig);

        const tabLane = new WidgetConfiguration(
            'config-item-details-object-info-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('config-item-details-object-info-tab-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabLane);

        const configItemHistoryLane = new WidgetConfiguration(
            'config-item-details-history-widget', 'History', ConfigurationType.Widget,
            "config-item-history-widget", "Translatable#History", [],
            null, null, true, true, null, false
        );
        configurations.push(configItemHistoryLane);

        const linkedObjectsConfig = new LinkedObjectsWidgetConfiguration(
            'config-item-details-linked-objects-config', 'Linked Objects Config', ConfigurationType.LinkedObjects,
            [
                ["Config Items", KIXObjectType.CONFIG_ITEM],
                ["Tickets", KIXObjectType.TICKET],
                ["FAQs", KIXObjectType.FAQ_ARTICLE]
            ]
        );
        configurations.push(linkedObjectsConfig);

        const configItemLinkedObjectsLane = new WidgetConfiguration(
            'config-item-details-linked-object-widget', 'Linked Objects', ConfigurationType.Widget,
            'linked-objects-widget', 'Translatable#Linked Objects',
            ['linked-objects-edit-action'],
            new ConfigurationDefinition('config-item-details-linked-objects-config', ConfigurationType.LinkedObjects),
            null, true, true, null, false
        );
        configurations.push(configItemLinkedObjectsLane);


        const widgetConfig = new TableWidgetConfiguration(
            'config-item-details-version-list-table-widget', 'Table Widget', ConfigurationType.TableWidget,
            KIXObjectType.CONFIG_ITEM_VERSION
        );
        configurations.push(widgetConfig);

        const configItemVersionLane = new WidgetConfiguration(
            'config-item-details-version-widget', 'Version Widget', ConfigurationType.Widget,
            'table-widget', "Translatable#Overview Versions",
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
                    ),
                    new ConfiguredWidget(
                        'config-item-details-linked-object-widget', 'config-item-details-linked-object-widget', null,
                        [new UIComponentPermission('links', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'config-item-details-history-widget', 'config-item-details-history-widget', null,
                        [new UIComponentPermission('cmdb/configitems/*/history', [CRUD.READ])]
                    )
                ],
                [
                    new ConfiguredWidget(
                        'config-item-details-version-widget', 'config-item-details-version-widget', null,
                        [new UIComponentPermission('cmdb/configitems/*/versions', [CRUD.READ])]
                    )
                ],
                [
                    'config-item-create-action'
                ],
                [
                    'ticket-create-action', 'config-item-edit-action', 'linked-objects-edit-action', 'print-action'
                ],
                [],
                [
                    new ConfiguredWidget('config-item-details-object-info', 'config-item-details-object-info')
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
