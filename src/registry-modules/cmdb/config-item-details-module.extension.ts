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

        const actions = ['config-item-create-action'];
        const configItemActions = [
            'linked-objects-edit-action', 'ticket-create-action',
            'config-item-version-compare-action', 'config-item-version-create-action'
        ];

        return new ConfigItemDetailsContextConfiguration(
            this.getModuleId(), [], [], [], [], [], [], [], [], actions, configItemActions
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
