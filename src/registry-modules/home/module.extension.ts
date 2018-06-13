import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration, WidgetType, ConfiguredWidget, WidgetSize, DataType, ContextConfiguration
} from '@kix/core/dist/model';
import { TableColumnConfiguration } from '@kix/core/dist/browser';
import { HomeContextConfiguration, HomeContext } from '@kix/core/dist/browser/home';
import { TicketProperty } from '@kix/core/dist/model/';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return HomeContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        // sidebars
        const notesSidebar =
            new ConfiguredWidget("20180607-home-notes", new WidgetConfiguration(
                "notes-widget", "Notizen", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-note', false)
            );

        const sidebars = ['20180607-home-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];

        return new HomeContextConfiguration(
            this.getModuleId(),
            [],
            sidebars,
            sidebarWidgets,

            [],
            [],
            [],
            []
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
