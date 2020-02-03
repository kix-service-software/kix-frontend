/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from "../../server/extensions/IConfigurationExtension";
import { AdminContext } from "./webapp/core/AdminContext";
import { IConfiguration } from "../../model/configuration/IConfiguration";
import { WidgetConfiguration } from "../../model/configuration/WidgetConfiguration";
import { ConfigurationType } from "../../model/configuration/ConfigurationType";
import { ContextConfiguration } from "../../model/configuration/ContextConfiguration";
import { ConfiguredWidget } from "../../model/configuration/ConfiguredWidget";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return AdminContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        configurations.push(
            new WidgetConfiguration(
                'admin-dashboard-notes-widget', 'Notes Widget', ConfigurationType.Widget,
                'notes-widget', 'Translatable#Notes', [], null, null, false, false, 'kix-icon-note', false
            )
        );

        configurations.push(
            new WidgetConfiguration(
                'admin-dashboard-category-explorer', 'Category Explorer', ConfigurationType.Widget,
                'admin-modules-explorer', 'Translatable#Administration', [], null, null, false, false, null, false
            )
        );

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Admin Dashboard', ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget('admin-dashboard-notes-widget', 'admin-dashboard-notes-widget')
                ],
                [
                    new ConfiguredWidget('admin-dashboard-category-explorer', 'admin-dashboard-category-explorer')
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
