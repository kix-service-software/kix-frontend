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
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { CKEditor5Configuration } from './model/CKEditor5Configuration';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'CKEditor5';
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        return [new CKEditor5Configuration()];
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
