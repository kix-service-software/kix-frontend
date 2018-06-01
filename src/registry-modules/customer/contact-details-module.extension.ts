import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ContactDetailsContextConfiguration, ContactDetailsContext } from '@kix/core/dist/browser/contact';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize, CustomerProperty
} from '@kix/core/dist/model';
import { TableColumnConfiguration } from '@kix/core/dist/browser';

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

        const assignedCustomersLane = new ConfiguredWidget('contact-customer-list-widget', new WidgetConfiguration(
            'contact-customer-list-widget', 'Zugeordnete Kunden', [], {
                displayLimit: 10,
                tableColumns: [
                    new TableColumnConfiguration(CustomerProperty.CUSTOMER_ID, true, false, true, true, 130),
                    new TableColumnConfiguration(CustomerProperty.CUSTOMER_COMPANY_NAME, true, false, true, true, 130)
                    // TODO: ticket spalten
                ]
            },
            false, true, WidgetSize.LARGE, null, false
        ));

        const lanes = ['contact-customer-list-widget'];

        const laneWidgets: Array<ConfiguredWidget<any>> = [
            contactDetailsWidget, assignedCustomersLane
        ];

        const contactInfoLane =
            new ConfiguredWidget('contact-information-lane', new WidgetConfiguration(
                'contact-info-widget', 'Ansprechpartnerinformationen', [], {},
                false, true, WidgetSize.SMALL, null, false)
            );

        const laneTabs = ['contact-information-lane'];
        const laneTabWidgets = [contactInfoLane];

        const contactActions = [
            'contact-edit-action', 'contact-create-customer-action', 'contact-create-ticket-action',
            'contact-create-ci-action', 'contact-print-action'
        ];

        return new ContactDetailsContextConfiguration(
            this.getModuleId(),
            [], [], [], [],
            lanes, laneTabs, laneWidgets,
            laneTabWidgets, generalActions, contactActions,
            [], []
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
