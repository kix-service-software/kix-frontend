import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ContextConfiguration, WidgetConfiguration, WidgetSize, ConfiguredWidget } from '@kix/core/dist/model';
import { CMDBContext, CMDBContextConfiguration } from '@kix/core/dist/browser/cmdb';

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return CMDBContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        const sidebars = ['20180830-cmdb-notes-sidebar'];

        const notesSidebar = new ConfiguredWidget('20180830-cmdb-notes-sidebar',
            new WidgetConfiguration(
                'notes-widget', 'Notizen', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-notes', false
            ));

        const sidebarWidgets = [notesSidebar];

        const explorer = ['20180830-ci-class-explorer'];

        const ciClassExplorer = new ConfiguredWidget('20180830-ci-class-explorer',
            new WidgetConfiguration(
                'config-item-class-explorer', 'CMDB Klassen', [], {}, false, false
            ));
        const explorerWidgets = [ciClassExplorer];

        return new CMDBContextConfiguration(
            this.getModuleId(), explorer, sidebars, sidebarWidgets, explorerWidgets, [], []
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
