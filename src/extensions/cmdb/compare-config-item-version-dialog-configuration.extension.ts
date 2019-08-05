/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ContextConfiguration, WidgetSize, ConfiguredWidget, WidgetConfiguration, KIXObjectType, TableWidgetSettings
} from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import {
    CompareConfigItemVersionDialogContext
} from "../../core/browser/cmdb";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return CompareConfigItemVersionDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const versionWidget =
            new ConfiguredWidget('compare-ci-version-widget', new WidgetConfiguration(
                'table-widget', 'Translatable#Selected Versions', ['switch-column-order-action'],
                new TableWidgetSettings(
                    KIXObjectType.CONFIG_ITEM_VERSION_COMPARE, null, null, null, null, null, null, false
                ),
                false, false, null, true
            ));

        const legendSidebar =
            new ConfiguredWidget('20190214082400-compare-ci-version-legend', new WidgetConfiguration(
                'config-item-version-compare-legend', 'Translatable#Legend', [], null,
                false, false, 'kix-icon-legend', false
            ));
        return new ContextConfiguration(
            CompareConfigItemVersionDialogContext.CONTEXT_ID,
            ['20190214082400-compare-ci-version-legend'], [legendSidebar],
            [], [],
            [], [],
            ['compare-ci-version-widget'], [versionWidget]
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
