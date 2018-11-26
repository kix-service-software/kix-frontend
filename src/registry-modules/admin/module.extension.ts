import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize,
} from '@kix/core/dist/model';
import { AdminContext, AdminContextConfiguration } from '@kix/core/dist/browser/admin';

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return AdminContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        const notesSidebar =
            new ConfiguredWidget('20181126-admin-notes', new WidgetConfiguration(
                'notes-widget', 'Notizen', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-note', false)
            );

        const sidebars = ['20181126-admin-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];

        return new AdminContextConfiguration(
            this.getModuleId(), [], sidebars, sidebarWidgets, [], [], []
        );
    }

    public async createFormDefinitions(): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
