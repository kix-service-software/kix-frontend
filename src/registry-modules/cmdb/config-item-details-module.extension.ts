import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration,
    WidgetSize,
    KIXObjectType,
    DataType
} from "@kix/core/dist/model";
import {
    TableColumnConfiguration, TableConfiguration,
    TableHeaderHeight, TableRowHeight
} from '@kix/core/dist/browser';
import { ConfigItemDetailsContextConfiguration, ConfigItemDetailsContext } from "@kix/core/dist/browser/cmdb";

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return ConfigItemDetailsContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        // Content Widgets
        const configItemDetailsWidget = new ConfiguredWidget("config-item-details", new WidgetConfiguration(
            "config-item-details-widget", "Config Item Details", [], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        const configItemInfoLaneTab =
            new ConfiguredWidget('config-item-info-lane',
                new WidgetConfiguration(
                    'config-item-info-widget', 'Config Item Informationen',
                    ['config-item-edit-action', 'config-item-print-action'],
                    {}, false, true, WidgetSize.LARGE, null, false
                )
            );

        const configItemHistoryLane =
            new ConfiguredWidget("config-item-history-widget", new WidgetConfiguration(
                "config-item-history-widget", "Historie", ['config-item-print-action'],
                new TableConfiguration(
                    null, null, [
                        new TableColumnConfiguration('HistoryType', true, false, true, true, 200),
                        new TableColumnConfiguration('Comment', true, false, true, true, 550),
                        new TableColumnConfiguration('CreateBy', true, false, true, true, 300),
                        new TableColumnConfiguration(
                            'CreateTime', true, false, true, true, 150, true, false, DataType.DATE_TIME
                        ),
                        new TableColumnConfiguration(
                            'Content', true, true, false, false, 150, false, true
                        )
                    ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
                true, true, WidgetSize.BOTH, null, false)
            );

        const configItemLinkedObjectsLane =
            new ConfiguredWidget('config-item-linked-objects-widget',
                new WidgetConfiguration(
                    'linked-objects-widget', 'Verknüpfte Objekte',
                    ['linked-objects-edit-action', 'config-item-print-action'],
                    {
                        linkedObjectTypes: [
                            ["Config Items", KIXObjectType.CONFIG_ITEM],
                            ["Tickets", KIXObjectType.TICKET],
                            ["FAQs", KIXObjectType.FAQ_ARTICLE]
                        ]
                    },
                    true, true, WidgetSize.LARGE, null, false
                )
            );

        const configItemGraphLane =
            new ConfiguredWidget('config-item-graph-widget',
                new WidgetConfiguration(
                    'config-item-graph-widget', 'Verknüpfungsgraph',
                    ['config-item-print-action'],
                    null,
                    true, true, WidgetSize.LARGE, null, false
                )
            );

        const configItemImagesLane =
            new ConfiguredWidget('config-item-images-widget',
                new WidgetConfiguration(
                    'config-item-images-widget', 'Bilder',
                    [],
                    null,
                    true, true, WidgetSize.LARGE, null, false
                )
            );

        const laneTabs = ['config-item-info-lane'];
        const laneTabWidgets = [configItemInfoLaneTab];

        const lanes = [
            'config-item-linked-objects-widget', 'config-item-graph-widget',
            'config-item-images-widget', 'config-item-history-widget'
        ];
        const laneWidgets: Array<ConfiguredWidget<any>> = [
            configItemDetailsWidget, configItemLinkedObjectsLane,
            configItemGraphLane, configItemImagesLane, configItemHistoryLane
        ];

        const actions = ['config-item-create-action'];
        const configItemActions = [
            'ticket-create-action', 'config-item-version-compare-action',
            'config-item-version-create-action', 'linked-objects-edit-action'
        ];

        const configItemVersionLane = new ConfiguredWidget('config-item-version-widget',
            new WidgetConfiguration(
                'config-item-version-widget', "Versionsdetails", ['config-item-version-compare-action'],
                null, false, true
            ));

        const content = ['config-item-version-widget'];
        const contentWidgets = [configItemVersionLane];

        return new ConfigItemDetailsContextConfiguration(
            this.getModuleId(), [], [], [], [], lanes, laneTabs, laneWidgets, laneTabWidgets,
            actions, configItemActions, content, contentWidgets
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
