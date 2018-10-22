import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    CustomerContext, CustomerContextConfiguration
} from '@kix/core/dist/browser/customer';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, CustomerProperty, WidgetSize, ContactProperty
} from '@kix/core/dist/model';
import {
    TableColumnConfiguration, TableConfiguration, TableRowHeight, TableHeaderHeight
} from '@kix/core/dist/browser';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return CustomerContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        const tableConfiguration = new TableConfiguration(
            null, 10,
            [
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
            ], null, true, false, null, null, TableHeaderHeight.LARGE, TableRowHeight.SMALL
        );

        const customerListWidget =
            new ConfiguredWidget('20180529102830', new WidgetConfiguration(
                'customer-list-widget', 'Übersicht Kunden', [
                    'customer-search-action',
                    'customer-create-action',
                    'csv-export-action'
                ], tableConfiguration,
                false, true, WidgetSize.LARGE, 'kix-icon-man-house', true)
            );

        const contactListWidget =
            new ConfiguredWidget('20180529144530', new WidgetConfiguration(
                'contact-list-widget', 'Übersicht Ansprechpartner', [
                    'contact-search-action',
                    'contact-create-action',
                    'csv-export-action'
                ], new TableConfiguration(
                    null, 10,
                    [
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
                    ], null, true, false, null, null, TableHeaderHeight.LARGE, TableRowHeight.SMALL
                ),
                false, true, WidgetSize.LARGE, 'kix-icon-man-bubble', true)
            );

        const content: string[] = ['20180529102830', '20180529144530'];
        const contentWidgets = [customerListWidget, contactListWidget];

        const notesSidebar =
            new ConfiguredWidget('20181010-customer-notes', new WidgetConfiguration(
                'notes-widget', 'Notizen', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-note', false)
            );

        const sidebars = ['20181010-customer-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];

        return new CustomerContextConfiguration(
            this.getModuleId(), [], sidebars, sidebarWidgets, [], content, contentWidgets
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
