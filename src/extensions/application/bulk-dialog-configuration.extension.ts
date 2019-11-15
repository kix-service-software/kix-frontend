/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ContextConfiguration, WidgetConfiguration, ConfiguredDialogWidget, ContextMode, KIXObjectType
} from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { BulkDialogContext } from "../../core/browser/bulk";
import { ConfigurationType, IConfiguration } from "../../core/model/configuration";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return BulkDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'bulk-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'bulk-dialog', 'Translatable#Edit Objects', [], null, null, false, false, 'kix-icon-edit'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'bulk-dialog-widget', 'bulk-dialog-widget',
                        KIXObjectType.ANY, ContextMode.EDIT_BULK
                    )
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
