/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { HomeContext } from './webapp/core';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { FilterCriteria } from '../../model/FilterCriteria';
import { SearchOperator } from '../search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { ChartComponentConfiguration } from '../report-charts/model/ChartComponentConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { WidgetSize } from '../../model/configuration/WidgetSize';
import { TicketProperty } from '../ticket/model/TicketProperty';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { SortOrder } from '../../model/SortOrder';
import { DefaultColumnConfiguration } from '../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../model/DataType';
import { ToggleOptions } from '../table/model/ToggleOptions';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ReportChartWidgetConfiguration } from '../report-charts/model/ReportChartWidgetConfiguration';
import { CSVFormatConfiguration } from '../report-charts/model/CSVFormatConfiguration';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { ReportingAPIService } from '../reporting/server/ReportingService';
import { ReportDefinition } from '../reporting/model/ReportDefinition';
import { ReportDefinitionProperty } from '../reporting/model/ReportDefinitionProperty';
import { ObjectResponse } from '../../server/services/ObjectResponse';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return HomeContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const stateTypeFilterCriteria = new FilterCriteria(
            TicketProperty.STATE_TYPE, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'Open'
        );

        const openTicketsLoadingOptions = new KIXObjectLoadingOptions();
        openTicketsLoadingOptions.filter = [
            new FilterCriteria(
                TicketProperty.OWNER_ID, SearchOperator.EQUALS,
                FilterDataType.STRING, FilterType.OR, KIXObjectType.CURRENT_USER
            ),
            new FilterCriteria(
                TicketProperty.RESPONSIBLE_ID, SearchOperator.EQUALS,
                FilterDataType.STRING, FilterType.OR, KIXObjectType.CURRENT_USER
            ),
            stateTypeFilterCriteria
        ];
        openTicketsLoadingOptions.sortOrder = 'Ticket.-Age:numeric';
        openTicketsLoadingOptions.limit = 10;
        openTicketsLoadingOptions.searchLimit = 100;

        const tableMyOpenTicketsConfiguration = new TableConfiguration(
            'home-dashboard-ticket-table-myOpenTickets', 'Translatable#My Open Tickets Table', ConfigurationType.Table,
            KIXObjectType.TICKET, openTicketsLoadingOptions, null, null, null, true, true,
            new ToggleOptions('ticket-article-details', 'article', [], true)
        );
        configurations.push(tableMyOpenTicketsConfiguration);

        const tableMyOpenTicketsWidgetConfiguration = new TableWidgetConfiguration(
            'home-dashboard-ticket-table-myOpenTickets-widget', 'Translatable#My Open Tickets Table Widget',
            ConfigurationType.TableWidget, KIXObjectType.TICKET, [TicketProperty.AGE, SortOrder.DOWN],
            new ConfigurationDefinition('home-dashboard-ticket-table-myOpenTickets', ConfigurationType.Table)
        );
        configurations.push(tableMyOpenTicketsWidgetConfiguration);

        const myOpenTicketsWidget = new WidgetConfiguration(
            'home-dashboard-myOpenTickets-widget', 'Translatable#My Open Tickets Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#My Open Tickets', ['bulk-action', 'csv-export-action'],
            new ConfigurationDefinition(
                'home-dashboard-ticket-table-myOpenTickets-widget', ConfigurationType.TableWidget
            ),
            null, false, true, 'kix-icon-ticket', false
        );
        configurations.push(myOpenTicketsWidget);

        const newTicketsLoadingOptions = new KIXObjectLoadingOptions();
        newTicketsLoadingOptions.filter = [
            new FilterCriteria(
                TicketProperty.STATE_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.OR, 1
            )
        ];
        newTicketsLoadingOptions.sortOrder = 'Ticket.-Age:numeric';
        newTicketsLoadingOptions.limit = 10;
        newTicketsLoadingOptions.searchLimit = 100;

        const newTicketsTableConfig = new TableConfiguration(
            'home-dashboard-ticket-table-new', 'Translatable#New Tickets Table', ConfigurationType.Table,
            KIXObjectType.TICKET, newTicketsLoadingOptions,
            null,
            [
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.PRIORITY_ID, false, true, true, false, 65, true, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.TICKET_NUMBER, true, false, true, true, 135, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.TITLE, true, false, true, true, 463, true, true, false, DataType.STRING,
                    true, null, null, false
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.QUEUE_ID, true, false, true, true, 175, true, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.ORGANISATION_ID, true, false, true, true, 225, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.CREATED, true, false, true, true, 155, true, true, false, DataType.DATE_TIME
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.AGE, true, false, true, true, 90, true, true, false, DataType.NUMBER
                ),
            ], null,
            true, true, new ToggleOptions('ticket-article-details', 'article', [], true)
        );
        configurations.push(newTicketsTableConfig);

        const newTicketsTableWidget = new TableWidgetConfiguration(
            'home-dashboard-ticket-new-table-widget', 'Translatable#New Tickets Table Widget',
            ConfigurationType.TableWidget,
            KIXObjectType.TICKET, [TicketProperty.AGE, SortOrder.UP],
            new ConfigurationDefinition('home-dashboard-ticket-table-new', ConfigurationType.Table),
            null, null, true
        );
        configurations.push(newTicketsTableWidget);

        const newTicketsWidget = new WidgetConfiguration(
            'home-dashboard-new-tickets-widget', 'Translatable#New Tickets Widget', ConfigurationType.Widget,
            'table-widget', 'New Tickets', ['bulk-action', 'csv-export-action'],
            new ConfigurationDefinition('home-dashboard-ticket-new-table-widget', ConfigurationType.TableWidget),
            null, false, true, 'kix-icon-ticket', false
        );
        configurations.push(newTicketsWidget);

        const notesSidebar = new WidgetConfiguration(
            'home-dashboard-notes-widget', 'Translatable#Notes', ConfigurationType.Widget,
            'notes-widget', 'Translatable#Notes', [], null, null,
            false, true, 'kix-icon-note', false
        );
        configurations.push(notesSidebar);

        const chartWidgets = await this.getChartWidgetConfigurations();

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget('home-dashboard-notes-widget', 'home-dashboard-notes-widget')
                ],
                [], [],
                [
                    ...chartWidgets,
                    new ConfiguredWidget(
                        'home-dashboard-myOpenTickets-widget', 'home-dashboard-myOpenTickets-widget', null,
                        [new UIComponentPermission('tickets', [CRUD.READ])]
                    ),
                    new ConfiguredWidget(
                        'home-dashboard-new-tickets-widget', 'home-dashboard-new-tickets-widget', null,
                        [new UIComponentPermission('tickets', [CRUD.READ])]
                    )
                ], [], [], [], [], [],
                true
            )
        );

        return configurations;
    }

    private async getChartWidgetConfigurations(): Promise<ConfiguredWidget[]> {
        const chartWidgets: ConfiguredWidget[] = [];

        const priorityReportId = await this.getReportId('Number of open tickets by priority');
        chartWidgets.push(new ConfiguredWidget(
            'home-dashboard-ticket-chart-widget-priorities', null,
            new WidgetConfiguration(
                'home-dashboard-ticket-chart-widget-priorities', 'Priority Chart Widget',
                ConfigurationType.Widget,
                'report-chart-widget', 'Translatable#Number of open tickets by priority', [], null,
                new ReportChartWidgetConfiguration(
                    'home-dashboard-ticket-chart-widget-priorities-chart', 'Translatable#Priority Chart',
                    new ChartComponentConfiguration(
                        'home-dashboard-ticket-chart-widget-priorities-config', 'Translatable#Priority Chart',
                        ConfigurationType.Chart,
                        {
                            type: 'bar',
                            options: {
                                legend: {
                                    display: false
                                },
                                scales: {
                                    yAxes: [{
                                        ticks: {
                                            beginAtZero: true,
                                            maxTicksLimit: 6
                                        }
                                    }]
                                }
                            }
                        }
                    ), priorityReportId, 'CSV', new CSVFormatConfiguration(['name'], 'name', ['count'], '"', ',')
                ), false, true, null, false
            ),
            [new UIComponentPermission('reporting/reports', [CRUD.READ])], WidgetSize.SMALL
        ));

        const stateReportId = await this.getReportId('Number of open tickets by state');
        chartWidgets.push(new ConfiguredWidget(
            'home-dashboard-ticket-chart-widget-states', null,
            new WidgetConfiguration(
                'home-dashboard-ticket-chart-widget-states', 'Translatable#States Chart Widget', ConfigurationType.Widget,
                'report-chart-widget', 'Translatable#Number of open tickets by state', [], null,
                new ReportChartWidgetConfiguration(
                    'home-dashboard-ticket-chart-widget-states-chart', 'Translatable#States Chart',
                    new ChartComponentConfiguration(
                        'home-dashboard-ticket-chart-widget-states-config', 'Translatable#States Chart', ConfigurationType.Chart,
                        {
                            type: 'pie',
                            options: {
                                legend: {
                                    display: true,
                                    position: 'bottom'
                                }
                            }
                        }
                    ), stateReportId, 'CSV', new CSVFormatConfiguration(['name'], 'name', ['count'], '"', ',')
                ), false, true, null, false
            ),
            [new UIComponentPermission('reporting/reports', [CRUD.READ])], WidgetSize.SMALL
        ));

        const createdTicketsReportId = await this.getReportId('Number of tickets created within the last 7 days');
        chartWidgets.push(new ConfiguredWidget(
            'home-dashboard-ticket-chart-widget-new', null,
            new WidgetConfiguration(
                'home-dashboard-ticket-chart-widget-new', 'Translatable#New Tickets Chart Widget', ConfigurationType.Widget,
                'report-chart-widget', 'Translatable#Number of tickets created within the last 7 days', [], null,
                new ReportChartWidgetConfiguration(
                    'home-dashboard-ticket-chart-widget-new-chart', 'Translatable#New Tickets Chart',
                    new ChartComponentConfiguration(
                        'home-dashboard-ticket-chart-widget-new-config', 'Translatable#New Tickets Chart', ConfigurationType.Chart,
                        {
                            type: 'line',
                            options: {
                                legend: {
                                    display: false
                                },
                                scales: {
                                    yAxes: [{
                                        ticks: {
                                            beginAtZero: true,
                                            maxTicksLimit: 6
                                        }
                                    }]
                                }
                            }
                        }
                    ), createdTicketsReportId, 'CSV', new CSVFormatConfiguration(['day'], 'day', ['count'], '"', ',')
                ), false, true, null, false
            ),
            [new UIComponentPermission('reporting/reports', [CRUD.READ])], WidgetSize.SMALL
        ));

        return chartWidgets;
    }

    private async getReportId(name: string): Promise<number> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const objectResponse = await ReportingAPIService.getInstance().loadObjects<ReportDefinition>(
            serverConfig?.BACKEND_API_TOKEN, 'home-configuration', KIXObjectType.REPORT_DEFINITION, null,
            new KIXObjectLoadingOptions([
                new FilterCriteria(
                    ReportDefinitionProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, name
                )
            ]), null
        ).catch(() => new ObjectResponse<ReportDefinition>());

        const reportDefinitions = objectResponse?.objects || [];
        return reportDefinitions?.length ? reportDefinitions[0].ID : null;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
