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
    TicketProperty, FilterCriteria, FilterDataType, FilterType, FormField, KIXObjectType, Form,
    FormContext, ContextConfiguration, CRUD, TableWidgetSettings, KIXObjectLoadingOptions, SortOrder,
    FormFieldOption, ObjectReferenceOptions, KIXObjectProperty, QueueProperty
} from '../../core/model';
import { TicketContext, TicketChartConfiguration } from '../../core/browser/ticket';
import {
    ToggleOptions, TableHeaderHeight, TableRowHeight, TableConfiguration, SearchOperator, SearchProperty
} from '../../core/browser';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../core/services';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class TicketModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return TicketContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const queueExplorer =
            new ConfiguredWidget(
                '20180813-ticket-queue-explorer', new WidgetConfiguration(
                    'ticket-queue-explorer', 'Translatable#Queues', [], {},
                    false, false, null
                ),
                [
                    new UIComponentPermission('tickets', [CRUD.READ]),
                    new UIComponentPermission('system/ticket/queues', [CRUD.READ])
                ]
            );

        const explorer = ['20180813-ticket-queue-explorer'];
        const explorerWidgets: Array<ConfiguredWidget<any>> = [queueExplorer];

        // sidebars
        const notesSidebar =
            new ConfiguredWidget('20180814-ticket-notes', new WidgetConfiguration(
                'notes-widget', 'Translatable#Notes', [], {},
                false, false, 'kix-icon-note', false)
            );

        const sidebars = ['20180814-ticket-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];


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

        const chartConfig1 = new TicketChartConfiguration(TicketProperty.PRIORITY_ID, {
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
        });
        const chart1 = new ConfiguredWidget('20180814-1-ticket-chart-widget', new WidgetConfiguration(
            'ticket-chart-widget', 'Translatable#Overview Ticket Priorities', [], chartConfig1,
            false, true, null, true),
            [new UIComponentPermission('tickets', [CRUD.READ])],
            WidgetSize.SMALL
        );

        const chartConfig2 = new TicketChartConfiguration(TicketProperty.STATE_ID, {
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
        });
        const chart2 = new ConfiguredWidget('20180814-2-ticket-chart-widget', new WidgetConfiguration(
            'ticket-chart-widget', 'Translatable#Overview Ticket States', [], chartConfig2,
            false, true, null, true),
            [new UIComponentPermission('tickets', [CRUD.READ])],
            WidgetSize.SMALL
        );

        const chartConfig3 = new TicketChartConfiguration(TicketProperty.CREATED, {
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
        } as any);
        const chart3 = new ConfiguredWidget('20180814-3-ticket-chart-widget', new WidgetConfiguration(
            'ticket-chart-widget', 'Translatable#New Tickets (recent 7 days)', [], chartConfig3,
            false, true, null, true),
            [new UIComponentPermission('tickets', [CRUD.READ])],
            WidgetSize.SMALL
        );

        const ticketListWidget =
            new ConfiguredWidget('20180814-ticket-list-widget',
                new WidgetConfiguration(
                    'table-widget', 'Translatable#Overview Tickets', [
                        'ticket-create-action', 'bulk-action', 'csv-export-action', 'ticket-search-action'
                    ],
                    new TableWidgetSettings(KIXObjectType.TICKET,
                        [TicketProperty.AGE, SortOrder.UP],
                        new TableConfiguration(KIXObjectType.TICKET,
                            new KIXObjectLoadingOptions(
                                [new FilterCriteria(
                                    TicketProperty.STATE_TYPE, SearchOperator.EQUALS, FilterDataType.STRING,
                                    FilterType.AND, 'Open'
                                )], 'Ticket.-Age:numeric', 1000
                            ),
                            null, null,
                            true, true,
                            new ToggleOptions('ticket-article-details', 'article', [], true),
                            null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
                        ),
                        null, true, null, predefinedTicketFilter
                    ),
                    false, false, 'kix-icon-ticket', true
                ),
                [new UIComponentPermission('tickets', [CRUD.READ])],
                WidgetSize.LARGE
            );

        const content = [
            '20180814-1-ticket-chart-widget', '20180814-2-ticket-chart-widget',
            '20180814-3-ticket-chart-widget', '20180814-ticket-list-widget'
        ];
        const contentWidgets = [chart1, chart2, chart3, ticketListWidget];

        return new ContextConfiguration(
            this.getModuleId(),
            sidebars, sidebarWidgets,
            explorer, explorerWidgets,
            [], [],
            content, contentWidgets
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // tslint:disable:max-line-length
        const formId = 'link-ticket-search-form';
        const existingFormLinkWithTicket = ConfigurationService.getInstance().getConfiguration(formId);
        if (!existingFormLinkWithTicket) {

            const fields: FormField[] = [];
            fields.push(new FormField('Translatable#Full Text', SearchProperty.FULLTEXT, null, false, 'Translatable#Helptext_Tickets_Link_FullText'));
            fields.push(new FormField('Translatable#Ticket Number', TicketProperty.TICKET_NUMBER, null, false, 'Translatable#Helptext_Tickets_Link_Number'));
            fields.push(new FormField('Translatable#Title', TicketProperty.TITLE, null, false, 'Translatable#Helptext_Tickets_Link_Title'));
            fields.push(new FormField(
                'Translatable#Type', TicketProperty.TYPE_ID, 'object-reference-input', false, 'Translatable#Helptext_Tickets_Link_Type', [
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
            ));
            fields.push(new FormField(
                'Translatable#Assign Team / Queue', TicketProperty.QUEUE_ID, 'object-reference-input', false, 'Translatable#Helptext_Tickets_Link_Queue', [
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
                                    QueueProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, null
                                )
                            ],
                            null, null,
                            [QueueProperty.SUB_QUEUES, 'TicketStats', 'Tickets'],
                            [QueueProperty.SUB_QUEUES]
                        )
                    )
                ]
            ));
            fields.push(new FormField(
                'Translatable#Priority', TicketProperty.PRIORITY_ID, 'object-reference-input', false, 'Translatable#Helptext_Tickets_Link_Priority', [
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
            ));
            fields.push(new FormField(
                'Translatable#State', TicketProperty.STATE_ID, 'object-reference-input', false, 'Translatable#Helptext_Tickets_Link_State', [
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
            ));

            const attributeGroup = new FormGroup('Translatable#Ticket Attributes', fields);

            const form = new Form(
                formId, 'Translatable#Link to ticket', [attributeGroup],
                KIXObjectType.TICKET, false, FormContext.LINK, null, true
            );
            await ConfigurationService.getInstance().saveConfiguration(form.id, form);
        }
        ConfigurationService.getInstance().registerForm(
            [FormContext.LINK], KIXObjectType.TICKET, formId
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
