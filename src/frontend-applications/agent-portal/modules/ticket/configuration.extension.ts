/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { TicketContext, TicketChartWidgetConfiguration } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { KIXObjectPropertyFilter } from '../../model/KIXObjectPropertyFilter';
import { UIFilterCriterion } from '../../model/UIFilterCriterion';
import { TicketProperty } from './model/TicketProperty';
import { SearchOperator } from '../search/model/SearchOperator';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ChartComponentConfiguration } from '../charts/model/ChartComponentConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { TableHeaderHeight } from '../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../model/configuration/TableRowHeight';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { SortOrder } from '../../model/SortOrder';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { WidgetSize } from '../../model/configuration/WidgetSize';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { SearchProperty } from '../search/model/SearchProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { QueueProperty } from './model/QueueProperty';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration';
import { ToggleOptions } from '../table/model/ToggleOptions';
import { KIXExtension } from '../../../../server/model/KIXExtension';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return TicketContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        // Explorer
        const queueExplorerConfig = new WidgetConfiguration(
            'ticket-dashboard-queue-explorer', 'Ticket Queue Explorer', ConfigurationType.Widget,
            'ticket-queue-explorer', 'Translatable#Queues', [], null,
            null, false, true
        );
        configurations.push(queueExplorerConfig);

        const predefinedTicketFilter = [
            new KIXObjectPropertyFilter('Translatable#Owner', [
                new UIFilterCriterion(TicketProperty.OWNER_ID, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER)
            ]),
            new KIXObjectPropertyFilter('Translatable#Watched Tickets', [
                new UIFilterCriterion(
                    TicketProperty.WATCHERS, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER, true
                )
            ]),
            new KIXObjectPropertyFilter('Translatable#Unlocked Tickets', [
                new UIFilterCriterion(TicketProperty.LOCK_ID, SearchOperator.EQUALS, 1)
            ]),
            new KIXObjectPropertyFilter('Translatable#Locked Tickets', [
                new UIFilterCriterion(TicketProperty.LOCK_ID, SearchOperator.EQUALS, 2)
            ]),
            new KIXObjectPropertyFilter('Translatable#Responsible Tickets', [
                new UIFilterCriterion(
                    TicketProperty.RESPONSIBLE_ID, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER
                )
            ]),
        ];

        // content
        const chartConfig1 = new ChartComponentConfiguration(
            'ticket-dashboard-chart-priorities-config', 'Chart Config', ConfigurationType.Chart,
            {
                type: 'bar',
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
                },
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
        );
        configurations.push(chartConfig1);

        const chartWidgetConfig1 = new TicketChartWidgetConfiguration(
            'ticket-dashboard-chart-priorities', 'Ticket Chart Priorities', ConfigurationType.ChartWidget,
            TicketProperty.PRIORITY_ID,
            new ConfigurationDefinition('ticket-dashboard-chart-priorities-config', ConfigurationType.Chart), null
        );
        configurations.push(chartWidgetConfig1);

        const chartPrioritiesConfig = new WidgetConfiguration(
            'ticket-dashboard-chart-widget-priorities', 'Ticket Chart Priorities', ConfigurationType.Widget,
            'ticket-chart-widget', 'Translatable#Overview Ticket Priorities', [],
            new ConfigurationDefinition('ticket-dashboard-chart-priorities', ConfigurationType.ChartWidget),
            null, false, true, null, true
        );
        configurations.push(chartPrioritiesConfig);

        const chartConfig2 = new ChartComponentConfiguration(
            'ticket-dashboard-chart-states-config', 'Chart Config', ConfigurationType.Chart,
            {
                type: 'pie',
                data: {
                    datasets: [{
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
                    }]
                },
                options: {
                    legend: {
                        display: true,
                        position: 'right'
                    }
                }
            }
        );
        configurations.push(chartConfig2);

        const chartWidgetConfig2 = new TicketChartWidgetConfiguration(
            'ticket-dashboard-chart-states', 'Ticket Chart States', ConfigurationType.ChartWidget,
            TicketProperty.STATE_ID,
            new ConfigurationDefinition('ticket-dashboard-chart-states-config', ConfigurationType.Chart), null
        );
        configurations.push(chartWidgetConfig2);

        const chartStatesConfig = new WidgetConfiguration(
            'ticket-dashboard-chart-widget-states', 'Ticket Chart States', ConfigurationType.Widget,
            'ticket-chart-widget', 'Translatable#Overview Ticket States', [],
            new ConfigurationDefinition('ticket-dashboard-chart-states', ConfigurationType.ChartWidget),
            null, false, true, null, true
        );
        configurations.push(chartStatesConfig);

        const chartConfig3 = new ChartComponentConfiguration(
            'ticket-dashboard-chart-new-config', 'Chart Config', ConfigurationType.Chart,
            {
                type: 'line',
                data: {
                    datasets: [{
                        backgroundColor: 'rgb(91, 91, 91)'
                    }]
                },
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
            });
        configurations.push(chartConfig3);

        const chartWidgetConfig3 = new TicketChartWidgetConfiguration(
            'ticket-dashboard-chart-new', 'Ticket Chart New Tickets', ConfigurationType.ChartWidget,
            TicketProperty.CREATED,
            new ConfigurationDefinition('ticket-dashboard-chart-new-config', ConfigurationType.Chart), null
        );
        configurations.push(chartWidgetConfig3);

        const chartNewConfig = new WidgetConfiguration(
            'ticket-dashboard-chart-widget-new-tickets', 'Ticket Chart New Tickets', ConfigurationType.Widget,
            'ticket-chart-widget', 'Translatable#New Tickets (recent 7 days)', [],
            new ConfigurationDefinition('ticket-dashboard-chart-new', ConfigurationType.ChartWidget),
            null, false, true, null, true
        );
        configurations.push(chartNewConfig);

        const tableConfig = new TableConfiguration(
            'ticket-dashboard-table-config', 'Ticket Dashboard Table COnfiguration', ConfigurationType.Table,
            KIXObjectType.TICKET, null,
            null, null, [], true, true,
            new ToggleOptions('ticket-article-details', 'article', [], true),
            null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
        );
        configurations.push(tableConfig);

        const tableWidgetConfig = new TableWidgetConfiguration(
            'ticket-dashboard-table-widget-settings', 'Ticket Table Widget Settings', ConfigurationType.TableWidget,
            KIXObjectType.TICKET, [TicketProperty.AGE, SortOrder.UP],
            new ConfigurationDefinition('ticket-dashboard-table-config', ConfigurationType.Table), null,
            null, true, null, predefinedTicketFilter
        );
        configurations.push(tableWidgetConfig);

        const ticketListConfig = new WidgetConfiguration(
            'ticket-dashboard-ticket-list-widget', 'Ticket List Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Overview Tickets',
            [
                'bulk-action', 'csv-export-action'
            ],
            new ConfigurationDefinition('ticket-dashboard-table-widget-settings', ConfigurationType.TableWidget),
            null, false, false, 'kix-icon-ticket', true
        );
        configurations.push(ticketListConfig);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Ticket Dashboard Configuration', ConfigurationType.Context,
                this.getModuleId(),
                [],
                [
                    new ConfiguredWidget(
                        'ticket-dashboard-queue-explorer', 'ticket-dashboard-queue-explorer', null,
                        [
                            new UIComponentPermission('tickets', [CRUD.READ]),
                            new UIComponentPermission('system/ticket/queues', [CRUD.READ])
                        ]
                    )
                ], [],
                [
                    new ConfiguredWidget(
                        'ticket-dashboard-chart-widget-priorities', 'ticket-dashboard-chart-widget-priorities', null,
                        [new UIComponentPermission('tickets', [CRUD.READ])], WidgetSize.SMALL
                    ),
                    new ConfiguredWidget(
                        'ticket-dashboard-chart-widget-states', 'ticket-dashboard-chart-widget-states', null,
                        [new UIComponentPermission('tickets', [CRUD.READ])], WidgetSize.SMALL
                    ),
                    new ConfiguredWidget(
                        'ticket-dashboard-chart-widget-new-tickets', 'ticket-dashboard-chart-widget-new-tickets', null,
                        [new UIComponentPermission('tickets', [CRUD.READ])], WidgetSize.SMALL
                    ),
                    new ConfiguredWidget(
                        'ticket-dashboard-ticket-list-widget', 'ticket-dashboard-ticket-list-widget', null,
                        [new UIComponentPermission('tickets', [CRUD.READ])], WidgetSize.LARGE
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'ticket-link-form';

        configurations.push(
            new FormFieldConfiguration(
                'ticket-link-form-field-fulltext',
                'Translatable#Full Text', SearchProperty.FULLTEXT, null, false,
                'Translatable#Helptext_Tickets_Link_FullText'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-link-form-field-ticket-number',
                'Translatable#Ticket Number', TicketProperty.TICKET_NUMBER, null, false,
                'Translatable#Helptext_Tickets_Link_Number')
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-link-form-field-title',
                'Translatable#Title', TicketProperty.TITLE, null, false, 'Translatable#Helptext_Tickets_Link_Title'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-link-form-field-type',
                'Translatable#Type', TicketProperty.TYPE_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_Link_Type',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_TYPE),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-link-form-field-queue',
                'Translatable#Assign Team / Queue', TicketProperty.QUEUE_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_Link_Queue',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                ),
                                new FilterCriteria(
                                    QueueProperty.PARENT_ID, SearchOperator.EQUALS,
                                    FilterDataType.STRING, FilterType.AND, null
                                )
                            ],
                            null, null,
                            [QueueProperty.SUB_QUEUES],
                            [QueueProperty.SUB_QUEUES]
                        )
                    )
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-link-form-field-priority',
                'Translatable#Priority', TicketProperty.PRIORITY_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_Link_Priority',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_PRIORITY),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-link-form-field-state',
                'Translatable#State', TicketProperty.STATE_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_Link_State',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_STATE),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'ticket-link-form-group-attributes',
                'Translatable#Ticket Attributes',
                [
                    'ticket-link-form-field-fulltext',
                    'ticket-link-form-field-ticket-number',
                    'ticket-link-form-field-title',
                    'ticket-link-form-field-type',
                    'ticket-link-form-field-queue',
                    'ticket-link-form-field-priority',
                    'ticket-link-form-field-state'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'ticket-link-form-page', 'Translatable#Link to ticket',
                ['ticket-link-form-group-attributes']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Link to ticket',
                ['ticket-link-form-page'],
                KIXObjectType.TICKET, false, FormContext.LINK
            )
        );

        ModuleConfigurationService.getInstance().registerForm([FormContext.LINK], KIXObjectType.TICKET, formId);
        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
