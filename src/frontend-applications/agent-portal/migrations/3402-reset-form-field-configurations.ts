/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IMigration } from './IMigration';
import { SysConfigService } from '../modules/sysconfig/server/SysConfigService';

import { ConfigurationService } from '../../../server/services/ConfigurationService';
import { KIXObjectType } from '../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../model/FilterCriteria';
import { SysConfigOptionProperty } from '../modules/sysconfig/model/SysConfigOptionProperty';
import { SysConfigOptionDefinitionProperty } from '../modules/sysconfig/model/SysConfigOptionDefinitionProperty';
import { SearchOperator } from '../modules/search/model/SearchOperator';
import { FilterDataType } from '../model/FilterDataType';
import { FilterType } from '../model/FilterType';
import { ConfigurationType } from '../model/configuration/ConfigurationType';
import { SysConfigOptionDefinition } from '../modules/sysconfig/model/SysConfigOptionDefinition';

class Migration implements IMigration {

    public buildNumber: number = 3402;

    public name: string = '3402 reset form field configuration';

    public async migrate(): Promise<void | Error> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

        const sysConfigDefinitions = await SysConfigService.getInstance().loadObjects<SysConfigOptionDefinition>(
            serverConfig.BACKEND_API_TOKEN, '', KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, null,
            new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(
                        SysConfigOptionDefinitionProperty.CONTEXT_METADATA,
                        SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, ConfigurationType.FormField
                    ),
                    new FilterCriteria(
                        SysConfigOptionDefinitionProperty.IS_MODIFIED,
                        SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, 1
                    )
                ]
            ), null
        );

        if (sysConfigDefinitions && sysConfigDefinitions.length) {
            for (const sysconfig of sysConfigDefinitions) {
                SysConfigService.getInstance().updateObject(
                    serverConfig.BACKEND_API_TOKEN, '', KIXObjectType.SYS_CONFIG_OPTION,
                    [[SysConfigOptionProperty.VALUE, null]], sysconfig.Name
                );
            }
        }
    }
}

module.exports = new Migration();
