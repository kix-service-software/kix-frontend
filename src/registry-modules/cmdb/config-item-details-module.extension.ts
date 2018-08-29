import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration,
    WidgetSize,
    KIXObjectType
} from "@kix/core/dist/model";
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

        const configItemLinkedObjectsLane =
            new ConfiguredWidget('config-item-linked-objects-widget',
                new WidgetConfiguration(
                    'config-item-linked-objects-widget', 'Verknüpfte Objekte',
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

        const laneTabs = ['config-item-info-lane'];
        const laneTabWidgets = [configItemInfoLaneTab];

        const lanes = ['config-item-linked-objects-widget', 'config-item-graph-widget'];
        const laneWidgets: Array<ConfiguredWidget<any>> = [
            configItemDetailsWidget, configItemLinkedObjectsLane, configItemGraphLane
        ];

        const actions = ['config-item-create-action'];
        const configItemActions = [
            'ticket-create-action', 'config-item-version-compare-action',
            'config-item-version-create-action', 'linked-objects-edit-action'
        ];

        return new ConfigItemDetailsContextConfiguration(
            this.getModuleId(), [], [], [], [], lanes, laneTabs, laneWidgets, laneTabWidgets, actions, configItemActions
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
