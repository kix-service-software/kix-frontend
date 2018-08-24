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

        // const actions = ['new-config-item-action'];
        // const configItemActions = [
        //     'config-item-link-action', 'new-ticket-action',
        //     'version-compare-action', 'new-version-action'
        // ];

        return new ConfigItemDetailsContextConfiguration(
            this.getModuleId(), [], [], [], [], [], [], [], [], [], []
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
