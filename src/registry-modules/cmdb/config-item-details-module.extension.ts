import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration,
    WidgetSize
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
                    [],
                    {}, false, true, WidgetSize.LARGE, null, false
                )
            );

        const laneTabs = ['config-item-info-lane'];
        const laneTabWidgets = [configItemInfoLaneTab];

        const laneWidgets: Array<ConfiguredWidget<any>> = [
            configItemDetailsWidget
        ];

        const actions = ['config-item-create-action'];
        const configItemActions = [
            'ticket-create-action', 'config-item-version-compare-action',
            'config-item-version-create-action', 'linked-objects-edit-action'
        ];

        return new ConfigItemDetailsContextConfiguration(
            this.getModuleId(), [], [], [], [], [], laneTabs, laneWidgets, laneTabWidgets, actions, configItemActions
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
