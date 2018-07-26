import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';
import { FAQContext, FAQContextConfiguration } from '@kix/core/dist/browser/faq';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return FAQContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        const notesSidebar =
            new ConfiguredWidget("20180726-faq-notes", new WidgetConfiguration(
                "notes-widget", "Notizen", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-note', false)
            );

        const sidebars = ['20180726-faq-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];

        return new FAQContextConfiguration(this.getModuleId(), [], sidebars, sidebarWidgets, [], [], []);
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
