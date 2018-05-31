import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    CustomerContextConfiguration, CustomerDetialsContextConfiguration, CustomerDetailsContext
} from '@kix/core/dist/browser/customer';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, CustomerProperty,
    WidgetSize, ContactProperty, TicketProperty
} from '@kix/core/dist/model';
import { TableColumnConfiguration } from '@kix/core/dist/browser';

export class ModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return CustomerDetailsContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        const ticketDetailsWidget = new ConfiguredWidget('customer-details-widget', new WidgetConfiguration(
            'customer-details-widget', 'Kunden Details', [], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        const assignedContactsLane = new ConfiguredWidget('customer-contact-list-widget', new WidgetConfiguration(
            'customer-contact-list-widget', 'Zugeordnete Ansprechpartner', [], {
                displayLimit: 10,
                tableColumns: [
                    new TableColumnConfiguration(ContactProperty.USER_FIRST_NAME, true, false, true, true, 130),
                    new TableColumnConfiguration(ContactProperty.USER_LAST_NAME, true, false, true, true, 130),
                    new TableColumnConfiguration(ContactProperty.USER_EMAIL, true, false, true, true, 130),
                    new TableColumnConfiguration(ContactProperty.USER_LOGIN, true, false, true, true, 130),
                    new TableColumnConfiguration('contact-new-ticket', true, false, true, false, 130)
                ]
            },
            false, true, WidgetSize.BOTH, null, false
        ));

        const customerInfoLane =
            new ConfiguredWidget('customer-information-lane', new WidgetConfiguration(
                'customer-info-widget', 'Kundeninformationen', [], {},
                false, true, WidgetSize.SMALL, null, false)
            );

        const assignedTicketsLane = new ConfiguredWidget('customer-assigned-tickets-widget', new WidgetConfiguration(
            'customer-assigned-tickets-widget', 'Übersicht Tickets', [], {},
            false, true, WidgetSize.BOTH, null, false
        ));

        const openTicketsGroup =
            new ConfiguredWidget('customer-open-tickets-group', new WidgetConfiguration(
                'customer-open-tickets-group', 'Offene Tickets', [], {
                    displayLimit: 10,
                    tableColumns: [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 130)
                    ]
                },
                false, true, WidgetSize.SMALL, null, false)
            );

        const lanes = ['customer-contact-list-widget', 'customer-assigned-tickets-widget'];

        const laneWidgets: Array<ConfiguredWidget<any>> = [
            ticketDetailsWidget, assignedContactsLane, assignedTicketsLane
        ];

        const laneTabs = ['customer-information-lane'];
        const laneTabWidgets = [customerInfoLane];

        const customerActions = [
            'customer-edit-action', 'customer-create-contact-action', 'customer-create-ticket-action',
            'customer-create-ci-action', 'customer-print-action'
        ];

        const groups = [openTicketsGroup];

        return new CustomerDetialsContextConfiguration(
            this.getModuleId(), [], [], [], [], lanes, laneTabs,
            laneWidgets, laneTabWidgets, [], customerActions, groups, []
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
