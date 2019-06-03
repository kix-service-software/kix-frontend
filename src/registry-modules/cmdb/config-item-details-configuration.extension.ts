import { IConfigurationExtension } from "../../core/extensions";
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize, KIXObjectType, CRUD,
} from "../../core/model";
import { ConfigItemDetailsContext } from "../../core/browser/cmdb";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return ConfigItemDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const configItemInfoLaneTab =
            new ConfiguredWidget('config-item-info-lane',
                new WidgetConfiguration(
                    'config-item-info-widget', 'Translatable#Config Item Information',
                    ['config-item-edit-action', 'config-item-print-action'],
                    {}, false, true, WidgetSize.LARGE, null, false
                ),
                [new UIComponentPermission('cmdb/configitems', [CRUD.READ])]
            );

        const configItemHistoryLane =
            new ConfiguredWidget("config-item-history-widget",
                new WidgetConfiguration(
                    "config-item-history-widget", "Translatable#History", ['config-item-print-action'],
                    null, true, true, WidgetSize.BOTH, null, false
                ),
                [new UIComponentPermission('cmdb/configitems/*/history', [CRUD.READ])]
            );

        const configItemLinkedObjectsLane =
            new ConfiguredWidget('config-item-linked-objects-widget',
                new WidgetConfiguration(
                    'linked-objects-widget', 'Translatable#Linked Objects',
                    ['linked-objects-edit-action', 'config-item-print-action'],
                    {
                        linkedObjectTypes: [
                            ["Config Items", KIXObjectType.CONFIG_ITEM],
                            ["Tickets", KIXObjectType.TICKET],
                            ["FAQs", KIXObjectType.FAQ_ARTICLE]
                        ]
                    },
                    true, true, WidgetSize.LARGE, null, false
                ),
                [new UIComponentPermission('links', [CRUD.READ])]
            );

        const configItemGraphLane =
            new ConfiguredWidget('config-item-graph-widget',
                new WidgetConfiguration(
                    'config-item-graph-widget', 'Translatable#Link Graph',
                    ['config-item-print-action'],
                    null,
                    true, true, WidgetSize.LARGE, null, false
                ),
                [new UIComponentPermission('cmdb/configitems', [CRUD.READ])]
            );

        const configItemImagesLane =
            new ConfiguredWidget('config-item-images-widget',
                new WidgetConfiguration(
                    'config-item-images-widget', 'Translatable#Images',
                    [],
                    null,
                    true, true, WidgetSize.LARGE, null, false
                ),
                [new UIComponentPermission('cmdb/configitems/*/images', [CRUD.READ])]
            );

        const laneTabs = ['config-item-info-lane'];
        const laneTabWidgets = [configItemInfoLaneTab];

        const lanes = [
            'config-item-linked-objects-widget', 'config-item-graph-widget',
            'config-item-images-widget', 'config-item-history-widget'
        ];
        const laneWidgets: Array<ConfiguredWidget<any>> = [
            configItemLinkedObjectsLane, configItemGraphLane, configItemImagesLane, configItemHistoryLane
        ];

        const actions = ['config-item-create-action'];
        const configItemActions = [
            'ticket-create-action', 'config-item-version-compare-action',
            'config-item-edit-action', 'linked-objects-edit-action'
        ];

        const configItemVersionLane = new ConfiguredWidget('config-item-version-widget',
            new WidgetConfiguration(
                'table-widget', "Translatable#Version Details",
                ['config-item-version-compare-action', 'config-item-edit-action'],
                { objectType: KIXObjectType.CONFIG_ITEM_VERSION }, false, true, WidgetSize.BOTH, null, true
            ),
            [new UIComponentPermission('cmdb/configitems/*/versions', [CRUD.READ])]
        );

        const content = ['config-item-version-widget'];
        const contentWidgets = [configItemVersionLane];

        return new ContextConfiguration(
            this.getModuleId(),
            [], [],
            [], [],
            lanes, laneWidgets,
            laneTabs, laneTabWidgets,
            content, contentWidgets,
            actions, configItemActions,
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
