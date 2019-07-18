/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize
} from '../../core/model';
import { AdminContext } from '../../core/browser/admin';
import { AdminModuleService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return AdminContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(token: string): Promise<ContextConfiguration> {
        const notesSidebar =
            new ConfiguredWidget('20181126-admin-notes', new WidgetConfiguration(
                'notes-widget', 'Translatable#Notes', [], {},
                false, false, 'kix-icon-note', false)
            );

        const sidebars = ['20181126-admin-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];

        const adminModuleCategoriesExplorer =
            new ConfiguredWidget('20181127-admin-module-categories-explorer', new WidgetConfiguration(
                'admin-modules-explorer', 'Translatable#Administration', [], null,
                false, false, null, false)
            );

        const explorer = ['20181127-admin-module-categories-explorer'];
        const explorerWidgets: Array<ConfiguredWidget<any>> = [adminModuleCategoriesExplorer];

        return new ContextConfiguration(
            this.getModuleId(),
            sidebars, sidebarWidgets,
            explorer, explorerWidgets
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
