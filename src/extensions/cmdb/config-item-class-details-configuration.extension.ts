/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize, TableWidgetConfiguration,
    KIXObjectType, PermissionProperty, SortOrder, ConfigItemClassDefinitionProperty, TabWidgetConfiguration
} from '../../core/model';
import { TicketTypeDetailsContext } from '../../core/browser/ticket';
import { TableConfiguration, TableHeaderHeight, TableRowHeight, ToggleOptions } from '../../core/browser';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'config-item-class-details';
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const ciClassInfoWidget = new WidgetConfiguration(
            'ci-class-details-object-info', 'Object Info', ConfigurationType.Widget,
            'config-item-class-info-widget', 'Translatable#CI Class Information',
            [], null, null, false, true, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(ciClassInfoWidget);

        const tabConfig = new TabWidgetConfiguration(
            'ci-class-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['ci-class-details-object-info']
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabConfig);

        const tabLane = new WidgetConfiguration(
            'ci-class-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('ci-class-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabLane);


        const tableConfig = new TableConfiguration(
            'ci-class-details-version-table-config', 'Table Config', ConfigurationType.Table,
            KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION, null, null, null, null, null, true,
            new ToggleOptions('config-item-class-definition', 'definition', [], true), null,
            TableHeaderHeight.LARGE, TableRowHeight.LARGE
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tableConfig);

        const tableWidgetConfig = new TableWidgetConfiguration(
            'ci-class-details-version-table-widget-config', 'Table Widget Config', ConfigurationType.TableWidget,
            KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION,
            [ConfigItemClassDefinitionProperty.VERSION, SortOrder.DOWN],
            new ConfigurationDefinition('ci-class-details-version-table-config', ConfigurationType.TableWidget),
            null, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tableWidgetConfig);

        const ciClassVersionsWidget = new WidgetConfiguration(
            'ci-class-details-table-widget', 'Table Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Overview Versions', [],
            new ConfigurationDefinition('ci-class-details-version-table-widget-config', ConfigurationType.TableWidget),
            null, false, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(ciClassVersionsWidget);

        return new ContextConfiguration(
            this.getModuleId(), 'CI Class Details', ConfigurationType.Context,
            this.getModuleId(),
            [], [],
            [
                new ConfiguredWidget('ci-class-details-tab-widget', 'ci-class-details-tab-widget'),
                new ConfiguredWidget('ci-class-details-table-widget', 'ci-class-details-table-widget')
            ],
            [],
            [
                'cmdb-admin-ci-class-create'
            ],
            [
                'cmdb-admin-ci-class-edit', 'print-action'
            ],
            [],
            [
                new ConfiguredWidget('ci-class-details-object-info', 'ci-class-details-object-info')
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
