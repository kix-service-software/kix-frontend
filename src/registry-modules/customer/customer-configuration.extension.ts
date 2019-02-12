import { IConfigurationExtension } from '../../core/extensions';
import {
    CustomerContext, CustomerContextConfiguration
} from '../../core/browser/customer';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, CustomerProperty, WidgetSize, ContactProperty
} from '../../core/model';
import {
    TableColumnConfiguration, TableConfiguration, TableRowHeight, TableHeaderHeight
} from '../../core/browser';

export class DashboardModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return CustomerContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const customerListWidget =
            new ConfiguredWidget('20180529102830', new WidgetConfiguration(
                'customer-list-widget', 'Übersicht Kunden', [
                    'customer-search-action',
                    'customer-create-action',
                    'csv-export-action'
                ], new TableConfiguration(
                    null, null, null, null, true, false, null, null, TableHeaderHeight.LARGE, TableRowHeight.SMALL
                ),
                false, true, WidgetSize.LARGE, 'kix-icon-man-house', true)
            );

        const contactListWidget =
            new ConfiguredWidget('20180529144530', new WidgetConfiguration(
                'contact-list-widget', 'Übersicht Ansprechpartner', [
                    'contact-search-action',
                    'contact-create-action',
                    'csv-export-action'
                ], new TableConfiguration(
                    null, null, null, null, true, false, null, null, TableHeaderHeight.LARGE, TableRowHeight.SMALL
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

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
