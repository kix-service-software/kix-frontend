import { IConfigurationExtension } from '../../core/extensions';
import { CustomerDetailsContext } from '../../core/browser/customer';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize, ContactProperty,
    DataType, KIXObjectType
} from '../../core/model';
import { TableConfiguration, TableHeaderHeight, TableRowHeight, DefaultColumnConfiguration } from '../../core/browser';

export class ModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return CustomerDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const generalActions = ['customer-create-action'];
        const customerDetailsWidget = new ConfiguredWidget('customer-details-widget', new WidgetConfiguration(
            'customer-details-widget', 'Translatable#Customer Details', generalActions, null,
            false, true, WidgetSize.LARGE, null, false
        ));

        const customerInfoLane =
            new ConfiguredWidget('customer-information-lane', new WidgetConfiguration(
                'customer-info-widget', 'Translatable#Customer Information', [
                    'customer-edit-action', 'customer-print-action'
                ], {},
                false, true, WidgetSize.LARGE, null, false)
            );

        const assignedContactsLane = new ConfiguredWidget('customer-assigned-contacts-widget', new WidgetConfiguration(
            'customer-assigned-contacts-widget', 'Translatable#Assigned Contacts', [
                'customer-edit-action', 'customer-print-action'
            ], new TableConfiguration(KIXObjectType.CONTACT,
                null, null,
                [
                    new DefaultColumnConfiguration(
                        ContactProperty.USER_FIRST_NAME, true, false, true, true, 200, true, true
                    ),
                    new DefaultColumnConfiguration(
                        ContactProperty.USER_LAST_NAME, true, false, true, true, 200, true, true
                    ),
                    new DefaultColumnConfiguration(
                        ContactProperty.USER_EMAIL, true, false, true, true, 250, true, true
                    ),
                    new DefaultColumnConfiguration(
                        ContactProperty.USER_LOGIN, true, false, true, true, 200, true, true
                    ),
                    new DefaultColumnConfiguration(
                        ContactProperty.OPEN_TICKETS_COUNT, true, false, true, true, 150,
                        true, false, false, DataType.NUMBER
                    ),
                    new DefaultColumnConfiguration(
                        ContactProperty.ESCALATED_TICKETS_COUNT, true, false, true, true, 150,
                        true, false, false, DataType.NUMBER
                    ),
                    new DefaultColumnConfiguration(
                        ContactProperty.REMINDER_TICKETS_COUNT, true, false, true, true, 150,
                        true, false, false, DataType.NUMBER
                    ),
                    new DefaultColumnConfiguration(
                        ContactProperty.CREATE_NEW_TICKET, true, false, false, true, 150,
                        false, false, false, DataType.STRING, false, 'create-new-ticket-cell'
                    )
                ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
            ),
            false, true, WidgetSize.LARGE, null, false
        ));

        const assignedTicketsLane = new ConfiguredWidget('customer-assigned-tickets-widget', new WidgetConfiguration(
            'customer-assigned-tickets-widget', 'Translatable#Overview Tickets', [
                'customer-create-ticket-action', 'customer-print-action'
            ], {},
            false, true, WidgetSize.LARGE, null, false
        ));

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

        return new ContextConfiguration(
            this.getModuleId(),
            [], [],
            [], [],
            lanes, laneWidgets,
            laneTabs, laneTabWidgets,
            [], [],
            generalActions, customerActions
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
