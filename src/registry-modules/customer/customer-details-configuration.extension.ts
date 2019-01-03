import { IConfigurationExtension } from '../../core/extensions';
import { CustomerDetailsContextConfiguration, CustomerDetailsContext } from '../../core/browser/customer';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration,
    WidgetSize, ContactProperty, TicketProperty, DataType
} from '../../core/model';
import {
    TableColumnConfiguration, TableConfiguration, TableHeaderHeight, TableRowHeight
} from '../../core/browser';

export class ModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return CustomerDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const generalActions = ['customer-create-action'];
        const customerDetailsWidget = new ConfiguredWidget('customer-details-widget', new WidgetConfiguration(
            'customer-details-widget', 'Kunden Details', generalActions, null,
            false, true, WidgetSize.LARGE, null, false
        ));

        const customerInfoLane =
            new ConfiguredWidget('customer-information-lane', new WidgetConfiguration(
                'customer-info-widget', 'Kundeninformationen', [
                    'customer-edit-action', 'customer-print-action'
                ], {},
                false, true, WidgetSize.LARGE, null, false)
            );

        const assignedContactsLane = new ConfiguredWidget('customer-assigned-contacts-widget', new WidgetConfiguration(
            'customer-assigned-contacts-widget', 'Zugeordnete Ansprechpartner', [
                'customer-edit-action', 'customer-print-action'
            ], new TableConfiguration(
                null, null,
                [
                    new TableColumnConfiguration(ContactProperty.USER_FIRST_NAME, true, false, true, true, 200),
                    new TableColumnConfiguration(ContactProperty.USER_LAST_NAME, true, false, true, true, 200),
                    new TableColumnConfiguration(ContactProperty.USER_EMAIL, true, false, true, true, 250),
                    new TableColumnConfiguration(ContactProperty.USER_LOGIN, true, false, true, true, 200),
                    new TableColumnConfiguration(
                        ContactProperty.OPEN_TICKETS_COUNT, true, false, true, true, 150, true, null, DataType.NUMBER),
                    new TableColumnConfiguration(
                        ContactProperty.ESCALATED_TICKETS_COUNT, true, false, true, true, 150,
                        true, null, DataType.NUMBER
                    ),
                    new TableColumnConfiguration(
                        ContactProperty.REMINDER_TICKETS_COUNT, true, false, true, true, 150,
                        true, null, DataType.NUMBER
                    ),
                    new TableColumnConfiguration(
                        'contact-new-ticket', true, false, true, false, 150,
                        true, null, null, null, 'kix-icon-new-ticket'
                    )
                ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
            ),
            false, true, WidgetSize.LARGE, null, false
        ));

        const assignedTicketsLane = new ConfiguredWidget('customer-assigned-tickets-widget', new WidgetConfiguration(
            'customer-assigned-tickets-widget', 'Übersicht Tickets', [
                'customer-create-ticket-action', 'customer-print-action'
            ], {},
            false, true, WidgetSize.LARGE, null, false
        ));

        const openTicketsGroup =
            new ConfiguredWidget('customer-open-tickets-group', new WidgetConfiguration(
                'customer-open-tickets-group', 'Offene Tickets', [], new TableConfiguration(
                    null, null,
                    [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, false, true, true, true, 65),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 135),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 260),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, false, true, true, true, 80),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 100),
                        new TableColumnConfiguration(TicketProperty.CUSTOMER_USER_ID, true, false, true, true, 150),
                        new TableColumnConfiguration(
                            TicketProperty.CHANGED, true, false, true, true, 125, true, false, DataType.DATE_TIME
                        ),
                        new TableColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 75, true, false, DataType.DATE_TIME
                        )
                    ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
                true, true, WidgetSize.SMALL, null, false)
            );

        const escalatedTicketsGroup =
            new ConfiguredWidget('customer-escalated-tickets-group', new WidgetConfiguration(
                'customer-escalated-tickets-group', 'Eskalierte Tickets', [], new TableConfiguration(
                    null, null,
                    [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, false, true, true, true, 65),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 135),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 260),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, false, true, true, true, 80),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 100),
                        new TableColumnConfiguration(TicketProperty.CUSTOMER_USER_ID, true, false, true, true, 150),
                        new TableColumnConfiguration(
                            TicketProperty.ESCALATION_RESPONSE_TIME, true, false, true, true, 150
                        ),
                        new TableColumnConfiguration(
                            TicketProperty.ESCALATION_UPDATE_TIME, true, false, true, true, 150
                        ),
                        new TableColumnConfiguration(
                            TicketProperty.ESCALATION_SOLUTIONS_TIME, true, false, true, true, 150
                        ),
                        new TableColumnConfiguration(
                            TicketProperty.CHANGED, true, false, true, true, 125, true, false, DataType.DATE_TIME
                        ),
                        new TableColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 75, true, false, DataType.DATE_TIME
                        )
                    ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
                true, true, WidgetSize.SMALL, null, false)
            );

        const reminderTicketsGroup =
            new ConfiguredWidget('customer-reminder-tickets-group', new WidgetConfiguration(
                'customer-reminder-tickets-group', 'Erinnerungstickets', [], new TableConfiguration(
                    null, null,
                    [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, false, true, true, true, 65),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 135),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 260),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, false, true, true, true, 80),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 100),
                        new TableColumnConfiguration(TicketProperty.CUSTOMER_USER_ID, true, false, true, true, 150),
                        new TableColumnConfiguration(TicketProperty.PENDING_TIME, true, false, true, true, 150),
                        new TableColumnConfiguration(
                            TicketProperty.CHANGED, true, false, true, true, 125, true, false, DataType.DATE_TIME
                        ),
                        new TableColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 75, true, false, DataType.DATE_TIME
                        )
                    ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
                true, true, WidgetSize.SMALL, null, false)
            );

        const newTicketsGroup =
            new ConfiguredWidget('customer-new-tickets-group', new WidgetConfiguration(
                'customer-new-tickets-group', 'Neue Tickets', [], new TableConfiguration(
                    null, null,
                    [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, false, true, true, true, 65),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 135),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 260),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, false, true, true, true, 80),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 100),
                        new TableColumnConfiguration(TicketProperty.CUSTOMER_USER_ID, true, false, true, true, 150),
                        new TableColumnConfiguration(
                            TicketProperty.CHANGED, true, false, true, true, 125, true, false, DataType.DATE_TIME
                        ),
                        new TableColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 75, true, false, DataType.DATE_TIME
                        )
                    ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
                true, true, WidgetSize.SMALL, null, false)
            );

        const pendingTicketsGroup =
            new ConfiguredWidget('customer-pending-tickets-group', new WidgetConfiguration(
                'customer-pending-tickets-group', 'Tickets in Wartestatus', [], new TableConfiguration(
                    null, null,
                    [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, false, true, true, true, 65),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 135),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 260),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, false, true, true, true, 80),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 100),
                        new TableColumnConfiguration(TicketProperty.CUSTOMER_USER_ID, true, false, true, true, 150),
                        new TableColumnConfiguration(TicketProperty.PENDING_TIME, true, false, true, true, 150),
                        new TableColumnConfiguration(
                            TicketProperty.CHANGED, true, false, true, true, 125, true, false, DataType.DATE_TIME
                        ),
                        new TableColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 75, true, false, DataType.DATE_TIME
                        )
                    ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
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
            escalatedTicketsGroup, reminderTicketsGroup, newTicketsGroup, openTicketsGroup, pendingTicketsGroup
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
