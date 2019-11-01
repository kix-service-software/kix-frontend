/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ContextConfiguration, WidgetSize, ConfiguredWidget, WidgetConfiguration,
    KIXObjectType, TableWidgetConfiguration, ConfiguredDialogWidget, ContextMode
} from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import {
    CompareConfigItemVersionDialogContext
} from "../../core/browser/cmdb";
import { ConfigurationType, ConfigurationDefinition } from "../../core/model/configuration";
import { ModuleConfigurationService } from "../../services";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return CompareConfigItemVersionDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const tableWidgetConfig = new TableWidgetConfiguration(
            'cmdb-ci-compare-dialog-table-widget-config', 'Table Widget Config', ConfigurationType.TableWidget,
            KIXObjectType.CONFIG_ITEM_VERSION_COMPARE, null, null, null, null, null, null, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tableWidgetConfig);

        const versionWidget = new WidgetConfiguration(
            'cmdb-ci-compare-dialog-table-widget', 'Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Selected Versions', ['switch-column-order-action'],
            new ConfigurationDefinition('cmdb-ci-compare-dialog-table-widget-config', ConfigurationType.TableWidget),
            null, false, false, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(versionWidget);

        const legendSidebar = new WidgetConfiguration(
            'cmdb-ci-compare-dialog-legend-widget', 'Widget', ConfigurationType.Widget,
            'config-item-version-compare-legend', 'Translatable#Legend', [], null, null,
            false, false, 'kix-icon-legend', false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(legendSidebar);

        const dialogWidget = new WidgetConfiguration(
            'cmdb-ci-compare-dialog-widget', 'Widget', ConfigurationType.Widget,
            'compare-config-item-version-dialog', 'Translatable#Compare Versions', [], null, null,
            false, false, 'kix-icon-comparison-version'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(dialogWidget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [
                new ConfiguredWidget('cmdb-ci-compare-dialog-legend-widget', 'cmdb-ci-compare-dialog-legend-widget')
            ],
            [], [], [], [], [],
            [],
            [
                new ConfiguredWidget('compare-ci-version-widget', 'cmdb-ci-compare-dialog-table-widget')
            ],
            [
                new ConfiguredDialogWidget(
                    'cmdb-ci-compare-dialog-widget', 'cmdb-ci-compare-dialog-widget',
                    KIXObjectType.CONFIG_ITEM_VERSION_COMPARE, ContextMode.EDIT
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
