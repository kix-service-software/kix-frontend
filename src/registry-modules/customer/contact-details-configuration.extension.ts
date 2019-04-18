import { IConfigurationExtension } from '../../core/extensions';
import { ContactDetailsContext } from '../../core/browser/contact';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize, CustomerProperty,
    DataType, KIXObjectType
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
            'contact-details-widget', 'Translatable#Contact Details', generalActions, null,
            false, true, WidgetSize.LARGE, null, false
        ));

        const contactInfoLane =
            new ConfiguredWidget('contact-information-lane', new WidgetConfiguration(
                'contact-info-widget', 'Translatable#Contact Information', [
                    'contact-edit-action', 'contact-print-action'
                ], {},
                false, true, WidgetSize.LARGE, null, false)
            );

        const assignedCustomersLane = new ConfiguredWidget('contact-assigned-customers-widget', new WidgetConfiguration(
            'contact-assigned-customers-widget', 'Translatable#Assigned Customers', [
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
            'contact-assigned-tickets-widget', 'Translatable#Overview Tickets', [
                'contact-create-ticket-action', 'contact-print-action'
            ], {},
            false, true, WidgetSize.LARGE, null, false
        ));

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

        return new ContextConfiguration(
            this.getModuleId(),
            [], [],
            [], [],
            lanes, laneWidgets,
            laneTabs, laneTabWidgets,
            [], [],
            generalActions, contactActions
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
