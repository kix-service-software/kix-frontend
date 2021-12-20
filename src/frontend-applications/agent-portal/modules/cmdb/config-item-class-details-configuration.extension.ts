/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { TableHeaderHeight } from '../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../model/configuration/TableRowHeight';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { ConfigItemClassDefinitionProperty } from './model/ConfigItemClassDefinitionProperty';
import { SortOrder } from '../../model/SortOrder';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { ToggleOptions } from '../table/model/ToggleOptions';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'config-item-class-details';
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const ciClassInfoWidget = new WidgetConfiguration(
            'ci-class-details-object-info', 'Object Info', ConfigurationType.Widget,
            'config-item-class-info-widget', 'Translatable#CI Class Information',
            [], null, null, false, true, null, false
        );
        configurations.push(ciClassInfoWidget);

        const tabConfig = new TabWidgetConfiguration(
            'ci-class-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['ci-class-details-object-info']
        );
        configurations.push(tabConfig);

        const tabLane = new WidgetConfiguration(
            'ci-class-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('ci-class-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabLane);

        const tableConfig = new TableConfiguration(
            'ci-class-details-version-table-config', 'Table Config', ConfigurationType.Table,
            KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION, null, null, null, null, null, true,
            new ToggleOptions('config-item-class-definition', 'definition', [], true), null,
            TableHeaderHeight.LARGE, TableRowHeight.LARGE
        );
        configurations.push(tableConfig);

        const tableWidgetConfig = new TableWidgetConfiguration(
            'ci-class-details-version-table-widget-config', 'Table Widget Config', ConfigurationType.TableWidget,
            KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION,
            [ConfigItemClassDefinitionProperty.VERSION, SortOrder.DOWN],
            new ConfigurationDefinition('ci-class-details-version-table-config', ConfigurationType.TableWidget),
            null, null, false
        );
        configurations.push(tableWidgetConfig);

        const ciClassVersionsWidget = new WidgetConfiguration(
            'ci-class-details-table-widget', 'Table Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Overview Versions', [],
            new ConfigurationDefinition('ci-class-details-version-table-widget-config', ConfigurationType.TableWidget),
            null, false, true, null, true
        );
        configurations.push(ciClassVersionsWidget);

        configurations.push(
            new ContextConfiguration(
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
                    'cmdb-admin-ci-class-edit'
                ],
                [],
                [
                    new ConfiguredWidget('ci-class-details-object-info', 'ci-class-details-object-info')
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
