/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ObjectFormConfigurationContext } from './webapp/core/ObjectFormConfigurationContext';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ObjectFormConfigurationContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Edit Object Form Dialog', ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], []
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
