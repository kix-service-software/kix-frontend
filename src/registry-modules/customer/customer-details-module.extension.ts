import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { CustomerDetailsContextConfiguration, CustomerDetailsContext } from '@kix/core/dist/browser/customer';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize, ContactProperty
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
            false, true, WidgetSize.LARGE, null, false
        ));

        const lanes = ['customer-contact-list-widget'];

        const laneWidgets: Array<ConfiguredWidget<any>> = [
            customerDetailsWidget, assignedContactsLane
        ];

        const customerInfoLane =
            new ConfiguredWidget('customer-information-lane', new WidgetConfiguration(
                'customer-info-widget', 'Kundeninformationen', [], {},
                false, true, WidgetSize.SMALL, null, false)
            );

        const laneTabs = ['customer-information-lane'];
        const laneTabWidgets = [customerInfoLane];

        const customerActions = [
            'customer-edit-action', 'customer-create-contact-action', 'customer-create-ticket-action',
            'customer-create-ci-action', 'customer-print-action'
        ];

        return new CustomerDetailsContextConfiguration(
            this.getModuleId(),
            [], [], [], [],
            lanes, laneTabs, laneWidgets,
            laneTabWidgets, generalActions, customerActions,
            []
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
