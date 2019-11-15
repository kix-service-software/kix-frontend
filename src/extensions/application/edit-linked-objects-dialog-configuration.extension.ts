/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ContextConfiguration, WidgetConfiguration, ConfiguredDialogWidget, KIXObjectType, ContextMode
} from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { EditLinkedObjectsDialogContext } from "../../core/browser/link";
import { ConfigurationType, IConfiguration } from "../../core/model/configuration";
import { ModuleConfigurationService } from "../../services";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditLinkedObjectsDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const widget = new WidgetConfiguration(
            'link-objects-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-linked-objects-dialog', 'Translatable#Edit Links', [], null, null, false, false, 'kix-icon-link'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'link-objects-edit-dialog-widget', 'link-objects-edit-dialog-widget',
                        KIXObjectType.LINK, ContextMode.EDIT_LINKS
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
