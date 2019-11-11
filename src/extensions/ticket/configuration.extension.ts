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
    ConfiguredWidget, WidgetConfiguration, WidgetSize, KIXObjectPropertyFilter, TableFilterCriteria,
    TicketProperty, FilterCriteria, FilterDataType, FilterType, KIXObjectType,
    FormContext, ContextConfiguration, CRUD, TableWidgetConfiguration,
    KIXObjectLoadingOptions, SortOrder, FormFieldOption, ObjectReferenceOptions, KIXObjectProperty,
    QueueProperty, ChartComponentConfiguration
} from '../../core/model';
import { TicketContext, TicketChartWidgetConfiguration } from '../../core/browser/ticket';
import {
    ToggleOptions, TableHeaderHeight, TableRowHeight, TableConfiguration, SearchOperator, SearchProperty
} from '../../core/browser';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService } from '../../core/services';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class TicketModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return TicketContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        // Explorer
        const queueExplorerConfig = new WidgetConfiguration(
            'ticket-dashboard-queue-explorer', 'Ticket Queue Explorer', ConfigurationType.Widget,
            'ticket-queue-explorer', 'Translatable#Queues', [], null,
            false, false, null
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(queueExplorerConfig);


        // sidebars
        const notesSidebarConfig = new WidgetConfiguration(
            'ticket-dashboard-notes-widget', 'Note Widget', ConfigurationType.Widget,
            'notes-widget', 'Translatable#Notes', [], null, null, false, false, 'kix-icon-note', false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(notesSidebarConfig);

        const predefinedTicketFilter = [
            new KIXObjectPropertyFilter('Translatable#Owner', [
                new TableFilterCriteria(TicketProperty.OWNER_ID, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER)
            ]),
            new KIXObjectPropertyFilter('Translatable#Watched Tickets', [
                new TableFilterCriteria(
                    TicketProperty.WATCHERS, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER, true
                )
            ]),
            new KIXObjectPropertyFilter('Translatable#Unlocked Tickets', [
                new TableFilterCriteria(TicketProperty.LOCK_ID, SearchOperator.EQUALS, 1)
            ]),
            new KIXObjectPropertyFilter('Translatable#Locked Tickets', [
                new TableFilterCriteria(TicketProperty.LOCK_ID, SearchOperator.EQUALS, 2)
            ]),
            new KIXObjectPropertyFilter('Translatable#Responsible Tickets', [
                new TableFilterCriteria(
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
                                "rgb(91, 91, 91)",
                                "rgb(4, 83, 125)",
                                "rgb(0, 141, 210)",
                                "rgb(129, 189, 223)",
                                "rgb(160, 230, 200)",
                                "rgb(130, 200, 38)",
                                "rgb(0, 152, 70)",
                                "rgb(227, 30, 36)",
                                "rgb(239, 127, 26)",
                                "rgb(254, 204, 0)"
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
        await ModuleConfigurationService.getInstance().saveConfiguration(chartConfig1);

        const chartWidgetConfig1 = new TicketChartWidgetConfiguration(
            'ticket-dashboard-chart-priorities', 'Ticket Chart Priorities', ConfigurationType.ChartWidget,
            TicketProperty.PRIORITY_ID,
            new ConfigurationDefinition('ticket-dashboard-chart-priorities-config', ConfigurationType.Chart), null
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chartWidgetConfig1);

        const chartPrioritiesConfig = new WidgetConfiguration(
            'ticket-dashboard-chart-widget-priorities', 'Ticket Chart Priorities', ConfigurationType.Widget,
            'ticket-chart-widget', 'Translatable#Overview Ticket Priorities', [],
            new ConfigurationDefinition('ticket-dashboard-chart-priorities', ConfigurationType.ChartWidget),
            null, false, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chartPrioritiesConfig);

        const chartConfig2 = new ChartComponentConfiguration(
            'ticket-dashboard-chart-states-config', 'Chart Config', ConfigurationType.Chart,
            {
                type: 'pie',
                data: {
                    datasets: [{
                        fill: true,
                        backgroundColor: [
                            "rgb(91, 91, 91)",
                            "rgb(4, 83, 125)",
                            "rgb(0, 141, 210)",
                            "rgb(129, 189, 223)",
                            "rgb(160, 230, 200)",
                            "rgb(130, 200, 38)",
                            "rgb(0, 152, 70)",
                            "rgb(227, 30, 36)",
                            "rgb(239, 127, 26)",
                            "rgb(254, 204, 0)"
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
        await ModuleConfigurationService.getInstance().saveConfiguration(chartConfig2);

        const chartWidgetConfig2 = new TicketChartWidgetConfiguration(
            'ticket-dashboard-chart-states', 'Ticket Chart States', ConfigurationType.ChartWidget,
            TicketProperty.STATE_ID,
            new ConfigurationDefinition('ticket-dashboard-chart-states-config', ConfigurationType.Chart), null
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chartWidgetConfig2);

        const chartStatesConfig = new WidgetConfiguration(
            'ticket-dashboard-chart-widget-states', 'Ticket Chart States', ConfigurationType.Widget,
            'ticket-chart-widget', 'Translatable#Overview Ticket States', [],
            new ConfigurationDefinition('ticket-dashboard-chart-states', ConfigurationType.ChartWidget),
            null, false, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chartStatesConfig);

        const chartConfig3 = new ChartComponentConfiguration(
            'ticket-dashboard-chart-new-config', 'Chart Config', ConfigurationType.Chart,
            {
                type: 'line',
                data: {
                    datasets: [{
                        backgroundColor: [
                            "rgb(91, 91, 91)",
                            "rgb(4, 83, 125)",
                            "rgb(0, 141, 210)",
                            "rgb(129, 189, 223)",
                            "rgb(160, 230, 200)",
                            "rgb(130, 200, 38)",
                            "rgb(0, 152, 70)",
                            "rgb(227, 30, 36)",
                            "rgb(239, 127, 26)",
                            "rgb(254, 204, 0)"
                        ]
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
        await ModuleConfigurationService.getInstance().saveConfiguration(chartConfig3);

        const chartWidgetConfig3 = new TicketChartWidgetConfiguration(
            'ticket-dashboard-chart-new', 'Ticket Chart New Tickets', ConfigurationType.ChartWidget,
            TicketProperty.CREATED,
            new ConfigurationDefinition('ticket-dashboard-chart-new-config', ConfigurationType.Chart), null
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chartWidgetConfig3);

        const chartNewConfig = new WidgetConfiguration(
            'ticket-dashboard-chart-widget-new-tickets', 'Ticket Chart New Tickets', ConfigurationType.Widget,
            'ticket-chart-widget', 'Translatable#New Tickets (recent 7 days)', [],
            new ConfigurationDefinition('ticket-dashboard-chart-new', ConfigurationType.ChartWidget),
            null, false, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(chartNewConfig);

        const tableConfig = new TableConfiguration(
            'ticket-dashboard-table-config', 'Ticket Dashboard Table COnfiguration', ConfigurationType.Table,
            KIXObjectType.TICKET, new KIXObjectLoadingOptions(
                [new FilterCriteria(
                    TicketProperty.STATE_TYPE, SearchOperator.EQUALS, FilterDataType.STRING,
                    FilterType.AND, 'Open'
                )], 'Ticket.-Age:numeric', 1000
            ),
            null, null, [], true, true,
            new ToggleOptions('ticket-article-details', 'article', [], true),
            null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tableConfig);

        const tableWidgetConfig = new TableWidgetConfiguration(
            'ticket-dashboard-table-widget-settings', 'Ticket Table Widget Settings', ConfigurationType.TableWidget,
            KIXObjectType.TICKET, [TicketProperty.AGE, SortOrder.UP],
            new ConfigurationDefinition('ticket-dashboard-table-config', ConfigurationType.Table), null,
            null, true, null, predefinedTicketFilter
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tableWidgetConfig);

        const ticketListConfig = new WidgetConfiguration(
            'ticket-dashboard-ticket-list-widget', 'Ticket List Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Overview Tickets',
            [
                'ticket-create-action', 'bulk-action', 'csv-export-action', 'ticket-search-action'
            ],
            new ConfigurationDefinition('ticket-dashboard-table-widget-settings', ConfigurationType.TableWidget),
            null, false, false, 'kix-icon-ticket', true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(ticketListConfig);

        return new ContextConfiguration(
            this.getModuleId(), 'Ticket Dashboard Configuration', ConfigurationType.Context,
            this.getModuleId(),
            [
                new ConfiguredWidget('ticket-notes', 'ticket-dashboard-notes-widget')
            ],
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
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'ticket-link-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-link-form-field-fulltext',
                'Translatable#Full Text', SearchProperty.FULLTEXT, null, false,
                'Translatable#Helptext_Tickets_Link_FullText'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-link-form-field-ticket-number',
                'Translatable#Ticket Number', TicketProperty.TICKET_NUMBER, null, false,
                'Translatable#Helptext_Tickets_Link_Number')
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-link-form-field-title',
                'Translatable#Title', TicketProperty.TITLE, null, false, 'Translatable#Helptext_Tickets_Link_Title'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
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
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-link-form-field-queue',
                'Translatable#Assign Team / Queue', TicketProperty.QUEUE_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_Link_Queue',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, true),
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
                            [QueueProperty.SUB_QUEUES, 'TicketStats', 'Tickets'],
                            [QueueProperty.SUB_QUEUES]
                        )
                    )
                ]
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
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
        await ModuleConfigurationService.getInstance().saveConfiguration(
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'ticket-link-form-page', 'Translatable#Link to ticket',
                ['ticket-link-form-group-attributes']
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#Link to ticket',
                ['ticket-link-form-page'],
                KIXObjectType.TICKET, false, FormContext.LINK
            )
        );

        ConfigurationService.getInstance().registerForm([FormContext.LINK], KIXObjectType.TICKET, formId);
    }
}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
