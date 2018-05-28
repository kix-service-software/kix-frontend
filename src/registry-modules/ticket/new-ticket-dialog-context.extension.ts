import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    NewTicketDialogContext, NewTicketDialogContextConfiguration
} from '@kix/core/dist/browser/ticket';
import { ContextConfiguration, ConfiguredWidget, WidgetSize, WidgetConfiguration } from '@kix/core/dist/model';

export class NewTicketDialogModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return NewTicketDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        const customerInfoSidebar =
            new ConfiguredWidget("20180524110915", new WidgetConfiguration(
                "ticket-customer-info-widget", "Kunde", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man-house', false)
            );
        const contactInfoSidebar =
            new ConfiguredWidget("20180524110920", new WidgetConfiguration(
                "ticket-contact-info-widget", "Ansprechpartner", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man-bubble', false)
            );
        const sidebars = ['20180524110915', '20180524110920'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [customerInfoSidebar, contactInfoSidebar];

        return new NewTicketDialogContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new NewTicketDialogModuleExtension();
};
