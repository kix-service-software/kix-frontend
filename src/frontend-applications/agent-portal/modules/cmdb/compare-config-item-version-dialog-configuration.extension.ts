/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { CompareConfigItemVersionContext } from './webapp/core/context/CompareConfigItemVersionContext';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { ContextMode } from '../../model/ContextMode';
import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return CompareConfigItemVersionContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const tableWidgetConfig = new TableWidgetConfiguration(
            'cmdb-ci-compare-dialog-table-widget-config', 'Table Widget Config', ConfigurationType.TableWidget,
            KIXObjectType.CONFIG_ITEM_VERSION_COMPARE, null, null, null, null, true, null, null, false
        );
        configurations.push(tableWidgetConfig);

        const versionWidget = new WidgetConfiguration(
            'cmdb-ci-compare-dialog-table-widget', 'Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Selected Versions', ['switch-column-order-action'],
            new ConfigurationDefinition('cmdb-ci-compare-dialog-table-widget-config', ConfigurationType.TableWidget),
            null, false, false, null, true
        );
        configurations.push(versionWidget);

        const legendSidebar = new WidgetConfiguration(
            'cmdb-ci-compare-dialog-legend-widget', 'Widget', ConfigurationType.Widget,
            'config-item-version-compare-legend', 'Translatable#Legend', [], null, null,
            false, false, 'kix-icon-legend', false
        );
        configurations.push(legendSidebar);

        const dialogWidget = new WidgetConfiguration(
            'cmdb-ci-compare-dialog-widget', 'Widget', ConfigurationType.Widget,
            'compare-config-item-version-dialog', 'Translatable#Compare Versions', [], null, null,
            false, true, 'kix-icon-comparison-version'
        );
        configurations.push(dialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget('cmdb-ci-compare-dialog-legend-widget', 'cmdb-ci-compare-dialog-legend-widget')
                ],
                [], [],
                [
                    new ConfiguredDialogWidget(
                        'cmdb-ci-compare-dialog-widget', 'cmdb-ci-compare-dialog-widget',
                        KIXObjectType.CONFIG_ITEM_VERSION_COMPARE, ContextMode.EDIT
                    )
                ], [], [], [],
                [
                    new ConfiguredWidget('compare-ci-version-widget', 'cmdb-ci-compare-dialog-table-widget')
                ]
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
