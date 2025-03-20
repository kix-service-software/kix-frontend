/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from '../../../model/configuration/IConfiguration';
import { SysConfigOption } from '../../../modules/sysconfig/model/SysConfigOption';

export interface IConfigurationResolver<T extends IConfiguration = IConfiguration> {

    resolve(token: string, configuration: T, sysConfigOptions: SysConfigOption[]): Promise<void>;

}
