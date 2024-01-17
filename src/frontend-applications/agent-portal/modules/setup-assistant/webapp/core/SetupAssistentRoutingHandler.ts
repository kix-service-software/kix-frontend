/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FilterCriteria } from '../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { AdminContext } from '../../../admin/webapp/core/AdminContext';
import { AdditionalRoutingHandler } from '../../../base-components/webapp/core/AdditionalRoutingHandler';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { Role } from '../../../user/model/Role';
import { RoleProperty } from '../../../user/model/RoleProperty';
import { AgentService } from '../../../user/webapp/core/AgentService';
import { SetupService } from './SetupService';

export class SetupAssistentRoutingHandler extends AdditionalRoutingHandler {

    public constructor() {
        super(20);
    }

    public async handleRouting(): Promise<boolean> {
        let routed: boolean = false;
        const isSetupNeeded = await this.isSetupNeeded();

        if (isSetupNeeded) {
            await ContextService.getInstance().setActiveContext('admin');
            const context = ContextService.getInstance().getActiveContext();
            if (context instanceof AdminContext) {
                context.setAdminModule('setup-assistant');
            }
            routed = true;
        }

        return routed;
    }

    private async isSetupNeeded(): Promise<boolean> {
        const isAllowedUser = await this.isAllowedUser();

        const steps = await SetupService.getInstance().getSetupSteps();
        const hasOpenSteps = steps.some((s) => !s.completed && !s.skipped);

        const isSetupNeeded = isAllowedUser && hasOpenSteps;
        return isSetupNeeded;
    }

    private async isAllowedUser(): Promise<boolean> {
        let isAllowedUser = false;

        const currentUser = await AgentService.getInstance().getCurrentUser();
        if (currentUser.UserID === 1) {
            isAllowedUser = true;
        } else {
            const loadingOptions = new KIXObjectLoadingOptions([
                new FilterCriteria(
                    RoleProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'Superuser'
                )
            ]);

            const roles = await KIXObjectService.loadObjects<Role>(KIXObjectType.ROLE, null, loadingOptions, null, true)
                .catch((): Role[] => []);

            if (Array.isArray(roles) && roles.length) {
                const superuserRoleId = roles[0].ID;
                isAllowedUser = currentUser.RoleIDs.some((rid) => rid === superuserRoleId);
            }
        }

        return isAllowedUser;
    }

}