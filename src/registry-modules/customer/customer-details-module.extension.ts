import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { CustomerDetailsContextConfiguration, CustomerDetailsContext } from '@kix/core/dist/browser/customer';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration,
    WidgetSize, ContactProperty, TicketProperty
} from '@kix/core/dist/model';
import { TableColumnConfiguration } from '@kix/core/dist/browser';

export class ModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return CustomerDetailsContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        const generalActions = ['customer-create-action'];
        const customerDetailsWidget = new ConfiguredWidget('customer-details-widget', new WidgetConfiguration(
            'customer-details-widget', 'Kunden Details', generalActions, null,
            false, true, WidgetSize.LARGE, null, false
        ));

        const customerInfoLane =
            new ConfiguredWidget('customer-information-lane', new WidgetConfiguration(
                'customer-info-widget', 'Kundeninformationen', [], {},
                false, true, WidgetSize.LARGE, null, false)
            );

        const assignedContactsLane = new ConfiguredWidget('customer-assigned-contacts-widget', new WidgetConfiguration(
            'customer-assigned-contacts-widget', 'Zugeordnete Ansprechpartner', [], {
                displayLimit: 10,
                tableColumns: [
                    new TableColumnConfiguration(ContactProperty.USER_FIRST_NAME, true, false, true, true, 130),
                    new TableColumnConfiguration(ContactProperty.USER_LAST_NAME, true, false, true, true, 130),
                    new TableColumnConfiguration(ContactProperty.USER_EMAIL, true, false, true, true, 130),
                    new TableColumnConfiguration(ContactProperty.USER_LOGIN, true, false, true, true, 130),
                    new TableColumnConfiguration('contact-new-ticket', true, false, true, false, 130)
                ]
            },
            false, true, WidgetSize.LARGE, null, false
        ));

        const assignedTicketsLane = new ConfiguredWidget('customer-assigned-tickets-widget', new WidgetConfiguration(
            'customer-assigned-tickets-widget', 'Übersicht Tickets', [], {},
            false, true, WidgetSize.LARGE, null, false
        ));

        const openTicketsGroup =
            new ConfiguredWidget('customer-open-tickets-group', new WidgetConfiguration(
                'customer-open-tickets-group', 'Offene Tickets', [], {
                    displayLimit: 10,
                    tableColumns: [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 130)
                    ]
                },
                true, true, WidgetSize.SMALL, null, false)
            );

        const escalatedTicketsGroup =
            new ConfiguredWidget('customer-escalated-tickets-group', new WidgetConfiguration(
                'customer-escalated-tickets-group', 'Eskalierte Tickets', [], {
                    displayLimit: 10,
                    tableColumns: [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(
                            TicketProperty.ESCALATION_RESPONSE_TIME, true, false, true, true, 130
                        ),
                        new TableColumnConfiguration(
                            TicketProperty.ESCALATION_UPDATE_TIME, true, false, true, true, 130
                        ),
                        new TableColumnConfiguration(
                            TicketProperty.ESCALATION_SOLUTIONS_TIME, true, false, true, true, 130
                        ),
                    ]
                },
                false, true, WidgetSize.SMALL, null, false)
            );

        const reminderTicketsGroup =
            new ConfiguredWidget('customer-reminder-tickets-group', new WidgetConfiguration(
                'customer-reminder-tickets-group', 'Erinnerungstickets', [], {
                    displayLimit: 10,
                    tableColumns: [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.PENDING_TIME, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 130)
                    ]
                },
                true, true, WidgetSize.SMALL, null, false)
            );

        const newTicketsGroup =
            new ConfiguredWidget('customer-new-tickets-group', new WidgetConfiguration(
                'customer-new-tickets-group', 'Neue Tickets', [], {
                    displayLimit: 10,
                    tableColumns: [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 130)
                    ]
                },
                true, true, WidgetSize.SMALL, null, false)
            );

        const pendingTicketsGroup =
            new ConfiguredWidget('customer-pending-tickets-group', new WidgetConfiguration(
                'customer-pending-tickets-group', 'Tickets in Wartestatus', [], {
                    displayLimit: 10,
                    tableColumns: [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.PENDING_TIME, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 130)
                    ]
                },
                true, true, WidgetSize.SMALL, null, false)
            );

        const lanes = ['customer-assigned-contacts-widget', 'customer-assigned-tickets-widget'];

        const laneWidgets: Array<ConfiguredWidget<any>> = [
            customerDetailsWidget, assignedContactsLane, assignedTicketsLane
        ];

        const laneTabs = ['customer-information-lane'];
        const laneTabWidgets = [customerInfoLane];

        const customerActions = [
            'customer-edit-action', 'customer-create-contact-action', 'customer-create-ticket-action',
            'customer-create-ci-action', 'customer-print-action'
        ];

        const groups = [
            openTicketsGroup, escalatedTicketsGroup, reminderTicketsGroup, newTicketsGroup, pendingTicketsGroup
        ];

        return new CustomerDetailsContextConfiguration(
            this.getModuleId(), [], [], [], [], lanes, laneTabs,
            laneWidgets, laneTabWidgets, generalActions, customerActions, groups, []
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
