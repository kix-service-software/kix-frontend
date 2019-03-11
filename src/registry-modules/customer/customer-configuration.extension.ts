import { IConfigurationExtension } from '../../core/extensions';
import { CustomerContext, CustomerContextConfiguration } from '../../core/browser/customer';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize, KIXObjectType
} from '../../core/model';
import { TableConfiguration } from '../../core/browser';

export class DashboardModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return CustomerContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const customerListWidget =
            new ConfiguredWidget('20180529102830', new WidgetConfiguration(
                'table-widget', 'Translatable#Overview Customer Organizations', [
                    'customer-search-action',
                    'customer-create-action',
                    'import-action',
                    'csv-export-action'
                ], {
                    objectType: KIXObjectType.CUSTOMER,
                    tableConfiguration: new TableConfiguration(KIXObjectType.CUSTOMER,
                        null, null, null, null, true
                    )
                },
                false, true, WidgetSize.LARGE, 'kix-icon-man-house', false)
            );

        const contactListWidget =
            new ConfiguredWidget('20180529144530', new WidgetConfiguration(
                'table-widget', 'Translatable#Overview Contacts', [
                    'contact-search-action',
                    'contact-create-action',
                    'csv-export-action'
                ], {
                    objectType: KIXObjectType.CONTACT,
                    tableConfiguration: new TableConfiguration(KIXObjectType.CONTACT,
                        null, null, null, null, true
                    )
                },
                false, true, WidgetSize.LARGE, 'kix-icon-man-bubble', false)
            );

        const content: string[] = ['20180529102830', '20180529144530'];
        const contentWidgets = [customerListWidget, contactListWidget];

        const notesSidebar =
            new ConfiguredWidget('20181010-customer-notes', new WidgetConfiguration(
                'notes-widget', 'Translatable#Notes', [], {},
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
