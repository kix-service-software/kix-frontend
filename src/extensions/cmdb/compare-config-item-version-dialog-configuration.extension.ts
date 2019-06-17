import {
    ContextConfiguration, WidgetSize, ConfiguredWidget, WidgetConfiguration, KIXObjectType
} from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import {
    CompareConfigItemVersionDialogContext
} from "../../core/browser/cmdb";
import {
    CompareConfigItemVersionDialogContextConfiguration
} from "../../core/browser/cmdb/context/CompareConfigItemVersionDialogContextConfiguration";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return CompareConfigItemVersionDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const versionWidget =
            new ConfiguredWidget('20190213082400-compare-ci-version-widget', new WidgetConfiguration(
                'table-widget', 'Translatable#Selected Versions', ['switch-column-order-action'],
                { objectType: KIXObjectType.CONFIG_ITEM_VERSION_COMPARE },
                false, false, null, true
            ));

        const legendSidebar =
            new ConfiguredWidget('20190214082400-compare-ci-version-legend', new WidgetConfiguration(
                'config-item-version-compare-legend', 'Translatable#Legend', [], null,
                false, false, 'kix-icon-legend', false
            ));
        return new CompareConfigItemVersionDialogContextConfiguration(
            ['20190214082400-compare-ci-version-legend'], [legendSidebar],
            versionWidget
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
