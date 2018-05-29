import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    NewCustomerDialogContext, CustomerContext, CustomerContextConfiguration
} from '@kix/core/dist/browser/customer';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, CustomerProperty, WidgetSize, ContactProperty
} from '@kix/core/dist/model';
import { TableColumnConfiguration } from '@kix/core/dist/browser';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return CustomerContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        const customerListWidget =
            new ConfiguredWidget('20180529102830', new WidgetConfiguration(
                'customer-list-widget', 'Kunden-Liste', [
                    'customer-search-action',
                    'customer-create-action'
                ], {
                    displayLimit: 10,
                    tableColumns: [
                        new TableColumnConfiguration(CustomerProperty.CUSTOMER_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(
                            CustomerProperty.CUSTOMER_COMPANY_NAME, true, false, true, true, 130
                        ),
                        new TableColumnConfiguration(
                            CustomerProperty.CUSTOMER_COMPANY_STREET, true, false, true, true, 130
                        ),
                        new TableColumnConfiguration(
                            CustomerProperty.CUSTOMER_COMPANY_City, true, false, true, true, 130
                        ),
                        new TableColumnConfiguration(
                            CustomerProperty.CUSTOMER_COMPANY_COUNTRY, true, false, true, true, 130
                        ),
                        new TableColumnConfiguration(CustomerProperty.VALID_ID, true, false, true, true, 130),
                    ]
                },
                false, true, WidgetSize.LARGE, null, true)
            );

        const contactListWidget =
            new ConfiguredWidget('20180529144530', new WidgetConfiguration(
                'contact-list-widget', 'Ansprechpartner-Liste', [
                    'contact-search-action',
                    'contact-create-action'
                ], {
                    displayLimit: 10,
                    tableColumns: [
                        new TableColumnConfiguration(ContactProperty.USER_FIRST_NAME, true, false, true, true, 130),
                        new TableColumnConfiguration(ContactProperty.USER_LAST_NAME, true, false, true, true, 130),
                        new TableColumnConfiguration(ContactProperty.USER_EMAIL, true, false, true, true, 130),
                        new TableColumnConfiguration(ContactProperty.USER_LOGIN, true, false, true, true, 130),
                        new TableColumnConfiguration(ContactProperty.USER_CUSTOMER_IDS, true, false, true, true, 130),
                        new TableColumnConfiguration(ContactProperty.USER_CUSTOMER_ID, true, false, true, true, 130),
                        new TableColumnConfiguration(ContactProperty.USER_PHONE, true, false, true, true, 130),
                        new TableColumnConfiguration(ContactProperty.USER_FAX, true, false, true, true, 130),
                        new TableColumnConfiguration(ContactProperty.USER_MOBILE, true, false, true, true, 130),
                        new TableColumnConfiguration(ContactProperty.USER_STREET, true, false, true, true, 130),
                        new TableColumnConfiguration(ContactProperty.USER_CITY, true, false, true, true, 130),
                        new TableColumnConfiguration(ContactProperty.USER_COUNTRY, true, false, true, true, 130),
                        new TableColumnConfiguration(ContactProperty.VALID_ID, true, false, true, true, 130)
                    ]
                },
                false, true, WidgetSize.LARGE, null, true)
            );

        const content: string[] = ['20180529102830', '20180529144530'];
        const contentWidgets = [customerListWidget, contactListWidget];
        return new CustomerContextConfiguration(this.getModuleId(), [], [], [], [], content, contentWidgets);
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
