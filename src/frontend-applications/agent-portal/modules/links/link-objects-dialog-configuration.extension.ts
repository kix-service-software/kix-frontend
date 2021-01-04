/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { LinkObjectDialogContext } from './webapp/core/context/LinkObjectDialogContext';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return LinkObjectDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context, this.getModuleId()
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
