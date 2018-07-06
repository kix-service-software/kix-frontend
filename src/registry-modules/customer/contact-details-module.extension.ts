import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ContactDetailsContextConfiguration, ContactDetailsContext } from '@kix/core/dist/browser/contact';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize, CustomerProperty, TicketProperty
} from '@kix/core/dist/model';
import {
    TableColumnConfiguration, TableConfiguration, TableHeaderHeight, TableRowHeight
} from '@kix/core/dist/browser';

export class ModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return ContactDetailsContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        const generalActions = ['contact-create-action'];
        const contactDetailsWidget = new ConfiguredWidget('contact-details-widget', new WidgetConfiguration(
            'contact-details-widget', 'Ansprechpartner Details', generalActions, null,
            false, true, WidgetSize.LARGE, null, false
        ));

        const contactInfoLane =
            new ConfiguredWidget('contact-information-lane', new WidgetConfiguration(
                'contact-info-widget', 'Ansprechpartnerinformationen', [
                    'contact-edit-action', 'contact-print-action'
                ], {},
                false, true, WidgetSize.LARGE, null, false)
            );

        const assignedCustomersLane = new ConfiguredWidget('contact-assigned-customers-widget', new WidgetConfiguration(
            'contact-assigned-customers-widget', 'Zugeordnete Kunden', [
                'contact-edit-action', 'contact-print-action'
            ], new TableConfiguration(
                null, 10,
                [
                    new TableColumnConfiguration(CustomerProperty.CUSTOMER_ID, true, false, true, true, 130),
                    new TableColumnConfiguration(CustomerProperty.CUSTOMER_COMPANY_NAME, true, false, true, true, 130),
                    new TableColumnConfiguration(CustomerProperty.OPEN_TICKETS_COUNT, true, false, true, true, 130),
                    new TableColumnConfiguration(
                        CustomerProperty.ESCALATED_TICKETS_COUNT, true, false, true, true, 130
                    ),
                    new TableColumnConfiguration(CustomerProperty.REMINDER_TICKETS_COUNT, true, false, true, true, 130),
                ], null, null, null, null, null, TableHeaderHeight.LARGE, TableRowHeight.SMALL
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
                'contact-open-tickets-group', 'Offene Tickets', [], new TableConfiguration(
                    null, 10,
                    [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 130)
                    ], null, null, null, null, null, TableHeaderHeight.LARGE, TableRowHeight.SMALL
                ),
                true, true, WidgetSize.SMALL, null, false)
            );

        const escalatedTicketsGroup =
            new ConfiguredWidget('contact-escalated-tickets-group', new WidgetConfiguration(
                'contact-escalated-tickets-group', 'Eskalierte Tickets', [], new TableConfiguration(
                    null, 10,
                    [
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
                    ], null, null, null, null, null, TableHeaderHeight.LARGE, TableRowHeight.SMALL
                ),
                false, true, WidgetSize.SMALL, null, false)
            );

        const reminderTicketsGroup =
            new ConfiguredWidget('contact-reminder-tickets-group', new WidgetConfiguration(
                'contact-reminder-tickets-group', 'Erinnerungstickets', [], new TableConfiguration(
                    null, 10,
                    [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.PENDING_TIME, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 130)
                    ], null, null, null, null, null, TableHeaderHeight.LARGE, TableRowHeight.SMALL
                ),
                true, true, WidgetSize.SMALL, null, false)
            );

        const newTicketsGroup =
            new ConfiguredWidget('contact-new-tickets-group', new WidgetConfiguration(
                'contact-new-tickets-group', 'Neue Tickets', [], new TableConfiguration(
                    null, 10,
                    [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 130)
                    ], null, null, null, null, null, TableHeaderHeight.LARGE, TableRowHeight.SMALL
                ),
                true, true, WidgetSize.SMALL, null, false)
            );

        const pendingTicketsGroup =
            new ConfiguredWidget('contact-pending-tickets-group', new WidgetConfiguration(
                'contact-pending-tickets-group', 'Tickets in Wartestatus', [], new TableConfiguration(
                    null, 10,
                    [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.PENDING_TIME, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 130)
                    ], null, null, null, null, null, TableHeaderHeight.LARGE, TableRowHeight.SMALL
                ),
                true, true, WidgetSize.SMALL, null, false)
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
            openTicketsGroup, escalatedTicketsGroup, reminderTicketsGroup, newTicketsGroup, pendingTicketsGroup
        ];

        return new ContactDetailsContextConfiguration(
            this.getModuleId(), [], [], [], [], lanes, laneTabs,
            laneWidgets, laneTabWidgets, generalActions, contactActions, groups, []
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
