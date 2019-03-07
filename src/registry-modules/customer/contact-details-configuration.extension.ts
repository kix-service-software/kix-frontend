import { IConfigurationExtension } from '../../core/extensions';
import { ContactDetailsContextConfiguration, ContactDetailsContext } from '../../core/browser/contact';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize, CustomerProperty,
    TicketProperty, DataType, KIXObjectType
} from '../../core/model';
import {
    TableConfiguration, TableHeaderHeight, TableRowHeight, DefaultColumnConfiguration
} from '../../core/browser';

export class ModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ContactDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const generalActions = ['contact-create-action'];
        const contactDetailsWidget = new ConfiguredWidget('contact-details-widget', new WidgetConfiguration(
            'contact-details-widget', 'Ansprechpartner Details', generalActions, null,
            false, true, WidgetSize.LARGE, null, false
        ));

        const contactInfoLane =
            new ConfiguredWidget('contact-information-lane', new WidgetConfiguration(
                'contact-info-widget', 'Ansprechpartner Informationen', [
                    'contact-edit-action', 'contact-print-action'
                ], {},
                false, true, WidgetSize.LARGE, null, false)
            );

        const assignedCustomersLane = new ConfiguredWidget('contact-assigned-customers-widget', new WidgetConfiguration(
            'contact-assigned-customers-widget', 'Zugeordnete Kunden', [
                'contact-edit-action', 'contact-print-action'
            ], new TableConfiguration(KIXObjectType.CUSTOMER,
                null, null,
                [
                    new DefaultColumnConfiguration(
                        CustomerProperty.CUSTOMER_ID, true, false, true, true, 230, true, true
                    ),
                    new DefaultColumnConfiguration(
                        CustomerProperty.CUSTOMER_COMPANY_NAME, true, false, true, true, 300, true, true
                    ),
                    new DefaultColumnConfiguration(
                        CustomerProperty.CUSTOMER_COMPANY_COUNTRY, true, false, true, true, 175, true, true
                    ),
                    new DefaultColumnConfiguration(
                        CustomerProperty.CUSTOMER_COMPANY_CITY, true, false, true, true, 175, true, true
                    ),
                    new DefaultColumnConfiguration(
                        CustomerProperty.CUSTOMER_COMPANY_STREET, true, false, true, true, 250, true, true
                    ),
                    new DefaultColumnConfiguration(
                        CustomerProperty.OPEN_TICKETS_COUNT, true, false, true, true, 150,
                        true, false, false, DataType.NUMBER
                    ),
                    new DefaultColumnConfiguration(
                        CustomerProperty.ESCALATED_TICKETS_COUNT, true, false, true, true, 150,
                        true, false, false, DataType.NUMBER
                    ),
                    new DefaultColumnConfiguration(
                        CustomerProperty.REMINDER_TICKETS_COUNT, true, false, true, true, 150,
                        true, false, false, DataType.NUMBER
                    ),
                ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
            ),
            false, true, WidgetSize.LARGE, null, false
        ));

        const assignedTicketsLane = new ConfiguredWidget('contact-assigned-tickets-widget', new WidgetConfiguration(
            'contact-assigned-tickets-widget', 'Übersicht Tickets', [
                'contact-create-ticket-action', 'contact-print-action'
            ], {},
            false, true, WidgetSize.LARGE, null, false
        ));

        const openTicketsGroup =
            new ConfiguredWidget('contact-open-tickets-group', new WidgetConfiguration(
                'contact-open-tickets-group', 'Offene Tickets', [], new TableConfiguration(KIXObjectType.TICKET,
                    null, null,
                    [
                        new DefaultColumnConfiguration(
                            TicketProperty.PRIORITY_ID, false, true, true, true, 65, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.TICKET_NUMBER, true, false, true, true, 135, true, true
                        ),
                        new DefaultColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 260, true, true),
                        new DefaultColumnConfiguration(
                            TicketProperty.STATE_ID, false, true, true, true, 80, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.QUEUE_ID, true, false, true, true, 100, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.CUSTOMER_ID, true, false, true, true, 150, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.CHANGED, true, false, true, true, 125, true, true, false, DataType.DATE_TIME
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 75, true, true, false, DataType.DATE_TIME
                        )
                    ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
                false, true, WidgetSize.SMALL, null, false)
            );

        const escalatedTicketsGroup =
            new ConfiguredWidget('contact-escalated-tickets-group', new WidgetConfiguration(
                'contact-escalated-tickets-group', 'Eskalierte Tickets', [], new TableConfiguration(
                    KIXObjectType.TICKET,
                    null, null,
                    [
                        new DefaultColumnConfiguration(
                            TicketProperty.PRIORITY_ID, false, true, true, true, 65, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.TICKET_NUMBER, true, false, true, true, 135, true, true
                        ),
                        new DefaultColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 260, true, true),
                        new DefaultColumnConfiguration(
                            TicketProperty.STATE_ID, false, true, true, true, 80, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.QUEUE_ID, true, false, true, true, 100, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.CUSTOMER_ID, true, false, true, true, 150, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.ESCALATION_RESPONSE_TIME, true, false, true, true, 150, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.ESCALATION_UPDATE_TIME, true, false, true, true, 150, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.ESCALATION_SOLUTIONS_TIME, true, false, true, true, 150, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.CHANGED, true, false, true, true, 125, true, true, false, DataType.DATE_TIME
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 75, true, true, false, DataType.DATE_TIME
                        )
                    ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
                false, true, WidgetSize.SMALL, null, false)
            );

        const reminderTicketsGroup =
            new ConfiguredWidget('contact-reminder-tickets-group', new WidgetConfiguration(
                'contact-reminder-tickets-group', 'Erinnerungstickets', [], new TableConfiguration(KIXObjectType.TICKET,
                    null, null,
                    [
                        new DefaultColumnConfiguration(
                            TicketProperty.PRIORITY_ID, false, true, true, true, 65, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.TICKET_NUMBER, true, false, true, true, 135, true, true
                        ),
                        new DefaultColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 260, true, true),
                        new DefaultColumnConfiguration(
                            TicketProperty.STATE_ID, false, true, true, true, 80, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.QUEUE_ID, true, false, true, true, 100, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.CUSTOMER_ID, true, false, true, true, 150, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.PENDING_TIME, true, false, true, true, 150, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.CHANGED, true, false, true, true, 125, true, true, false, DataType.DATE_TIME
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 75, true, true, false, DataType.DATE_TIME
                        )
                    ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
                false, true, WidgetSize.SMALL, null, false)
            );

        const newTicketsGroup =
            new ConfiguredWidget('contact-new-tickets-group', new WidgetConfiguration(
                'contact-new-tickets-group', 'Neue Tickets', [], new TableConfiguration(KIXObjectType.TICKET,
                    null, null,
                    [
                        new DefaultColumnConfiguration(
                            TicketProperty.PRIORITY_ID, false, true, true, true, 65, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.TICKET_NUMBER, true, false, true, true, 135, true, true
                        ),
                        new DefaultColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 260, true, true),
                        new DefaultColumnConfiguration(
                            TicketProperty.STATE_ID, false, true, true, true, 80, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.QUEUE_ID, true, false, true, true, 100, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.CUSTOMER_ID, true, false, true, true, 150, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.CHANGED, true, false, true, true, 125, true, true, false, DataType.DATE_TIME
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 75, true, true, false, DataType.DATE_TIME
                        )
                    ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
                false, true, WidgetSize.SMALL, null, false)
            );

        const pendingTicketsGroup =
            new ConfiguredWidget('contact-pending-tickets-group', new WidgetConfiguration(
                'contact-pending-tickets-group', 'Tickets in Wartestatus', [], new TableConfiguration(
                    KIXObjectType.TICKET,
                    null, null,
                    [
                        new DefaultColumnConfiguration(
                            TicketProperty.PRIORITY_ID, false, true, true, true, 65, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.TICKET_NUMBER, true, false, true, true, 135, true, true
                        ),
                        new DefaultColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 260, true, true),
                        new DefaultColumnConfiguration(
                            TicketProperty.STATE_ID, false, true, true, true, 80, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.QUEUE_ID, true, false, true, true, 100, true, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.CUSTOMER_ID, true, false, true, true, 150, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.PENDING_TIME, true, false, true, true, 150, true, true
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.CHANGED, true, false, true, true, 125, true, true, false, DataType.DATE_TIME
                        ),
                        new DefaultColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 75, true, true, false, DataType.DATE_TIME
                        )
                    ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
                false, true, WidgetSize.SMALL, null, false)
            );

        const lanes = ['contact-assigned-customers-widget', 'contact-assigned-tickets-widget'];

        const laneWidgets: Array<ConfiguredWidget<any>> = [
            contactDetailsWidget, assignedCustomersLane, assignedTicketsLane
        ];

        const laneTabs = ['contact-information-lane'];
        const laneTabWidgets = [contactInfoLane];

        const contactActions = [
            'contact-edit-action', 'contact-create-customer-action', 'contact-create-ticket-action',
            'contact-create-ci-action', 'contact-print-action'
        ];

        const groups = [
            escalatedTicketsGroup, reminderTicketsGroup, newTicketsGroup, openTicketsGroup, pendingTicketsGroup
        ];

        return new ContactDetailsContextConfiguration(
            this.getModuleId(), [], [], [], [], lanes, laneTabs,
            laneWidgets, laneTabWidgets, generalActions, contactActions, groups, []
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
