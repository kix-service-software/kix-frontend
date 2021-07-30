/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { ReportingContext } from './webapp/core/context/ReportingContext';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { SortOrder } from '../../model/SortOrder';
import { ReportDefinitionProperty } from './model/ReportDefinitionProperty';
import { ReportProperty } from './model/ReportProperty';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ReportingContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const reportDefinitionsTableWidget = new TableWidgetConfiguration(
            'reporting-dashboard-reportdefinitions-table-widget', 'Reporting Table Widget',
            ConfigurationType.TableWidget, KIXObjectType.REPORT_DEFINITION,
            [ReportDefinitionProperty.NAME, SortOrder.UP],
            new ConfigurationDefinition('reporting-dashboard-reportdefinitions-table', ConfigurationType.Table), null,
            null, true, null, null, false
        );
        configurations.push(reportDefinitionsTableWidget);

        const reportDefinitionsWidget = new WidgetConfiguration(
            'reporting-dashboard-reportdefinitions-widget', 'Report Widget', ConfigurationType.Widget,
            'reportdefinition-list-widget', 'Translatable#Overview Report Definitions',
            ['reportdefinition-search-action', 'reportdefinition-create-action', 'reportdefinition-edit-action',
                'reportdefinition-delete-action', 'import-action', 'csv-export-action'],
            new ConfigurationDefinition('reporting-dashboard-reportdefinitions-table-widget',
                ConfigurationType.TableWidget), null, false, true, 'kix-icon-kpi', true
        );
        configurations.push(reportDefinitionsWidget);

        const reportsTable = new TableConfiguration(
            'reporting-dashboard-reports-table', 'Reports Table', ConfigurationType.Table,
            KIXObjectType.REPORT, null, null, null, null, true
        );
        configurations.push(reportsTable);

        const reportsTableWidget = new TableWidgetConfiguration(
            'reporting-dashboard-reports-table-widget', 'Reports Table Widget', ConfigurationType.TableWidget,
            KIXObjectType.REPORT, [ReportProperty.ID, SortOrder.UP],
            new ConfigurationDefinition('reporting-dashboard-reports-table', ConfigurationType.Table), null,
            null, true, null, null, null, false
        );
        configurations.push(reportsTableWidget);

        const reportsWidget = new WidgetConfiguration(
            'reporting-dashboard-reports-widget', 'Reports Widget', ConfigurationType.Widget,
            'report-list-widget', 'Translatable#Overview Reports',
            ['report-search-action', 'report-create-action', 'report-delete-action'],
            new ConfigurationDefinition(
                'reporting-dashboard-reports-table-widget', ConfigurationType.TableWidget
            ),
            null, false, true, 'kix-icon-kpi', true
        );
        configurations.push(reportsWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(),
                [],
                [], [],
                [
                    new ConfiguredWidget(
                        'reporting-dashboard-reportdefinitions-widget', 'reporting-dashboard-reportdefinitions-widget',
                        null, [new UIComponentPermission('reporting/reportdefinitions', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'reporting-dashboard-reports-widget', 'reporting-dashboard-reports-widget',
                        null, [new UIComponentPermission('reporting/reportdefinitions', [CRUD.READ])]
                    ),
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
