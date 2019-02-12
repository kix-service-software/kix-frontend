import { IConfigurationExtension, KIXExtensions } from '../../core/extensions';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize, AdminModuleCategory, AdminModule,
} from '../../core/model';
import { AdminContext, AdminContextConfiguration } from '../../core/browser/admin';
import { PluginService, AdminModuleService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return AdminContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const notesSidebar =
            new ConfiguredWidget('20181126-admin-notes', new WidgetConfiguration(
                'notes-widget', 'Notizen', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-note', false)
            );

        const sidebars = ['20181126-admin-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];

        const categories = await AdminModuleService.getInstance().getAdminModuls();

        const adminModuleCategoriesExplorer =
            new ConfiguredWidget('20181127-admin-module-categories-explorer', new WidgetConfiguration(
                'admin-modules-explorer', 'Verwaltung', [], categories,
                false, false, WidgetSize.BOTH, null, false)
            );

        const explorer = ['20181127-admin-module-categories-explorer'];
        const explorerWidgets: Array<ConfiguredWidget<any>> = [adminModuleCategoriesExplorer];

        return new AdminContextConfiguration(
            this.getModuleId(), explorer, sidebars, sidebarWidgets, explorerWidgets, [], []
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
