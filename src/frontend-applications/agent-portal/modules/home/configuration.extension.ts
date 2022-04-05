/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { ChartComponentConfiguration } from '../charts/model/ChartComponentConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { WidgetSize } from '../../model/configuration/WidgetSize';
import { TicketChartWidgetConfiguration } from '../ticket/webapp/core';
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

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return HomeContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const stateTypeFilterCriteria = new FilterCriteria(
            TicketProperty.STATE_TYPE, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'Open'
        );

        const chartConfig1 = new ChartComponentConfiguration(
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
                },
                data: {
                    datasets: [
                        {
                            backgroundColor: [
                                'rgb(91, 91, 91)',
                                'rgb(4, 83, 125)',
                                'rgb(0, 141, 210)',
                                'rgb(129, 189, 223)',
                                'rgb(160, 230, 200)',
                                'rgb(130, 200, 38)',
                                'rgb(0, 152, 70)',
                                'rgb(227, 30, 36)',
                                'rgb(239, 127, 26)',
                                'rgb(254, 204, 0)'
                            ]
                        }
                    ]
                }
            }
        );
        configurations.push(chartConfig1);

        const chartWidgetConfig1 = new TicketChartWidgetConfiguration(
            'home-dashboard-ticket-chart-widget-priorities-chart', 'Translatable#Priority Chart',
            ConfigurationType.ChartWidget,
            TicketProperty.PRIORITY_ID,
            new ConfigurationDefinition(
                'home-dashboard-ticket-chart-widget-priorities-config', ConfigurationType.Chart
            ),
            null, new KIXObjectLoadingOptions([stateTypeFilterCriteria])
        );
        configurations.push(chartWidgetConfig1);

        const chart1 = new WidgetConfiguration(
            'home-dashboard-ticket-chart-widget-priorities', 'Translatable#Priority Chart Widget',
            ConfigurationType.Widget,
            'ticket-chart-widget', 'Overview Ticket Priorities', [],
            new ConfigurationDefinition(
                'home-dashboard-ticket-chart-widget-priorities-chart', ConfigurationType.ChartWidget
            ),
            null, false, true, null, false
        );
        configurations.push(chart1);

        const chartConfig2 = new ChartComponentConfiguration(
            'home-dashboard-ticket-chart-widget-states-config', 'Translatable#States Chart', ConfigurationType.Chart,
            {
                type: 'pie',
                options: {
                    legend: {
                        display: true,
                        position: 'right'
                    }
                },
                data: {
                    datasets: [
                        {
                            fill: true,
                            backgroundColor: [
                                'rgb(91, 91, 91)',
                                'rgb(4, 83, 125)',
                                'rgb(0, 141, 210)',
                                'rgb(129, 189, 223)',
                                'rgb(160, 230, 200)',
                                'rgb(130, 200, 38)',
                                'rgb(0, 152, 70)',
                                'rgb(227, 30, 36)',
                                'rgb(239, 127, 26)',
                                'rgb(254, 204, 0)'
                            ]
                        }
                    ]
                }
            }
        );
        configurations.push(chartConfig2);

        const chartWidgetConfig2 = new TicketChartWidgetConfiguration(
            'home-dashboard-ticket-chart-widget-states-chart', 'Translatable#States Chart',
            ConfigurationType.ChartWidget,
            TicketProperty.STATE_ID,
            new ConfigurationDefinition('home-dashboard-ticket-chart-widget-states-config', ConfigurationType.Chart),
            null, new KIXObjectLoadingOptions([stateTypeFilterCriteria])
        );
        configurations.push(chartWidgetConfig2);

        const chart2 = new WidgetConfiguration(
            'home-dashboard-ticket-chart-widget-states', 'Translatable#States Chart Widget', ConfigurationType.Widget,
            'ticket-chart-widget', 'Overview Ticket States', [],
            new ConfigurationDefinition(
                'home-dashboard-ticket-chart-widget-states-chart', ConfigurationType.ChartWidget
            ),
            null, false, true, null, false
        );
        configurations.push(chart2);

        const chartConfig3 = new ChartComponentConfiguration(
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
                },
                data: {
                    datasets: [{
                        backgroundColor: 'rgb(91, 91, 91)'
                    }]
                },
            }
        );
        configurations.push(chartConfig3);

        const chartWidgetConfig3 = new TicketChartWidgetConfiguration(
            'home-dashboard-ticket-chart-widget-new-chart', 'Translatable#New Tickets Chart',
            ConfigurationType.ChartWidget,
            TicketProperty.CREATED,
            new ConfigurationDefinition('home-dashboard-ticket-chart-widget-new-config', ConfigurationType.Chart),
            null, new KIXObjectLoadingOptions([stateTypeFilterCriteria])
        );
        configurations.push(chartWidgetConfig3);

        const chart3 = new WidgetConfiguration(
            'home-dashboard-ticket-chart-widget-new', 'Translatable#New Tickets Chart Widget', ConfigurationType.Widget,
            'ticket-chart-widget', 'Translatable#New Tickets (recent 7 days)', [],
            new ConfigurationDefinition('home-dashboard-ticket-chart-widget-new-chart',
                ConfigurationType.ChartWidget),
            null, false, true, null, false
        );
        configurations.push(chart3);

        const tableMyOpenTicketsConfiguration = new TableConfiguration(
            'home-dashboard-ticket-table-myOpenTickets', 'Translatable#My Open Tickets Table', ConfigurationType.Table,
            KIXObjectType.TICKET,
            new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(
                        TicketProperty.OWNER_ID, SearchOperator.EQUALS,
                        FilterDataType.STRING, FilterType.OR, KIXObjectType.CURRENT_USER
                    ),
                    new FilterCriteria(
                        TicketProperty.RESPONSIBLE_ID, SearchOperator.EQUALS,
                        FilterDataType.STRING, FilterType.OR, KIXObjectType.CURRENT_USER
                    ),
                    stateTypeFilterCriteria
                ], 'Ticket.-Age:numeric', 100, [TicketProperty.WATCHERS]
            ), null, null, null, true, true, new ToggleOptions('ticket-article-details', 'article', [], true)
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

        const newTicketsTableConfig = new TableConfiguration(
            'home-dashboard-ticket-table-new', 'Translatable#New Tickets Table', ConfigurationType.Table,
            KIXObjectType.TICKET,
            new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(
                        TicketProperty.STATE_ID, SearchOperator.EQUALS,
                        FilterDataType.NUMERIC, FilterType.OR, 1
                    )
                ], 'Ticket.-Age:numeric', 100, [TicketProperty.WATCHERS]
            ),
            null,
            [
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.PRIORITY_ID, false, true, true, false, 65, true, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.TICKET_NUMBER, true, false, true, true, 135, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.TITLE, true, false, true, true, 463, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.QUEUE_ID, true, false, true, true, 175, true, true, true
                ),
                // new DefaultColumnConfiguration(null, null, null,
                //     'DynamicFields.AffectedAsset', true, false, true, false, 200, true, true, true, undefined, true,
                //     'label-list-cell-content'
                // ),
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

        // sidebars
        const notesSidebar = new WidgetConfiguration(
            'home-dashboard-notes-widget', 'Translatable#Notes', ConfigurationType.Widget,
            'notes-widget', 'Translatable#Notes', [], null, null,
            false, true, 'kix-icon-note', false
        );
        configurations.push(notesSidebar);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget('home-dashboard-notes-widget', 'home-dashboard-notes-widget')
                ],
                [], [],
                [
                    new ConfiguredWidget(
                        'home-dashboard-ticket-chart-widget-priorities',
                        'home-dashboard-ticket-chart-widget-priorities',
                        null, [new UIComponentPermission('tickets', [CRUD.READ])], WidgetSize.SMALL
                    ),
                    new ConfiguredWidget(
                        'home-dashboard-ticket-chart-widget-states', 'home-dashboard-ticket-chart-widget-states', null,
                        [new UIComponentPermission('tickets', [CRUD.READ])], WidgetSize.SMALL
                    ),
                    new ConfiguredWidget(
                        'home-dashboard-ticket-chart-widget-new', 'home-dashboard-ticket-chart-widget-new', null,
                        [new UIComponentPermission('tickets', [CRUD.READ])], WidgetSize.SMALL
                    ),
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

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
