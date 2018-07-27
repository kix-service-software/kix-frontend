import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';
import { FAQContext, FAQContextConfiguration } from '@kix/core/dist/browser/faq';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return FAQContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        const articleListWidget =
            new ConfiguredWidget('20180727-faq-article-list-widget', new WidgetConfiguration(
                'faq-article-list-widget', 'Übersicht FAQ', [
                    'faq-article-create-action', 'csv-export-action'
                ], {},
                false, false, WidgetSize.BOTH, null, false)
            );

        const content = ['20180727-faq-article-list-widget'];
        const contentWidgets = [articleListWidget];

        const faqCategoryExplorer =
            new ConfiguredWidget('20180625-faq-category-explorer', new WidgetConfiguration(
                'faq-category-explorer', 'FAQ Kategorien', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-faq', false)
            );

        const explorer = ['20180625-faq-category-explorer'];
        const explorerWidgets: Array<ConfiguredWidget<any>> = [faqCategoryExplorer];

        const notesSidebar =
            new ConfiguredWidget('20180726-faq-notes', new WidgetConfiguration(
                'notes-widget', 'Notizen', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-note', false)
            );

        const sidebars = ['20180726-faq-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];

        return new FAQContextConfiguration(
            this.getModuleId(), explorer, sidebars, sidebarWidgets, explorerWidgets, content, contentWidgets
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
