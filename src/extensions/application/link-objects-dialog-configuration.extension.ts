/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextConfiguration } from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { LinkObjectDialogContext } from "../../core/browser/link";
import { ConfigurationType } from "../../core/model/configuration";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return LinkObjectDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context, this.getModuleId()
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        return;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
