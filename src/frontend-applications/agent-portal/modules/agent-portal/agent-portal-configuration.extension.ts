/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { FilterCriteria } from '../../model/FilterCriteria';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { AgentPortalConfiguration } from '../../model/configuration/AgentPortalConfiguration';
import { DisplayValueConfiguration } from '../../model/configuration/DisplayValueConfiguration';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { ObjectResponse } from '../../server/services/ObjectResponse';
import { SearchOperator } from '../search/model/SearchOperator';
import { Role } from '../user/model/Role';
import { RoleProperty } from '../user/model/RoleProperty';
import { RoleService } from '../user/server/RoleService';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'AgentPortal';
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const config = ConfigurationService.getInstance().getServerConfiguration();
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                RoleProperty.NAME, SearchOperator.IN, FilterDataType.STRING, FilterType.AND,
                ['Superuser', 'System Admin', 'FAQ Admin', 'Textmodule Admin']
            )
        ]);
        const roles = await RoleService.getInstance().loadObjects<Role>(
            config.BACKEND_API_TOKEN, 'AgentPortalConfigExtension', KIXObjectType.ROLE, null, loadingOptions, null
        ).catch((): ObjectResponse<Role> => new ObjectResponse([]));

        const agentPortalConfig = new AgentPortalConfiguration();
        agentPortalConfig.adminRoleIds = roles.objects?.map((r) => r.ID);

        return [agentPortalConfig, new DisplayValueConfiguration()];
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
