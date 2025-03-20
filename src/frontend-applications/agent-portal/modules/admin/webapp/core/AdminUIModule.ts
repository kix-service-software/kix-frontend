/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { AdminContext } from './AdminContext';
import { ContextType } from '../../../../model/ContextType';
import { IUIModule } from '../../../../model/IUIModule';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { SetupService } from '../../../setup-assistant/webapp/core/SetupService';
import { SetupStep } from '../../../setup-assistant/webapp/core/SetupStep';
import { AdministrationSocketClient } from './AdministrationSocketClient';
import { AgentSocketClient } from '../../../user/webapp/core/AgentSocketClient';
import { SysConfigService } from '../../../sysconfig/webapp/core';

export class UIModule implements IUIModule {

    public priority: number = 500;

    public name: string = 'AdminUIModule';

    private contextObjectTypes = [
        KIXObjectType.CONFIG_ITEM_CLASS,
        KIXObjectType.GENERAL_CATALOG_ITEM,
        KIXObjectType.NOTIFICATION,
        KIXObjectType.SYSTEM_ADDRESS,
        KIXObjectType.MAIL_ACCOUNT,
        KIXObjectType.MAIL_FILTER,
        KIXObjectType.WEBFORM,
        KIXObjectType.TRANSLATION,
        KIXObjectType.FAQ_CATEGORY,
        KIXObjectType.SYS_CONFIG_OPTION,
        KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
        KIXObjectType.TICKET_PRIORITY,
        KIXObjectType.TICKET_STATE,
        KIXObjectType.QUEUE,
        KIXObjectType.TEXT_MODULE,
        KIXObjectType.TICKET_TYPE,
        KIXObjectType.USER,
        KIXObjectType.ROLE,
        KIXObjectType.PERMISSION,
        KIXObjectType.JOB,
        KIXObjectType.IMPORT_EXPORT_TEMPLATE,
        KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN
    ];

    public async register(): Promise<void> {
        const adminModuleAllowed = await this.checkAdminModuleAllowed();
        if (adminModuleAllowed) {
            this.registerContextIfNeeded();
        }
    }

    public async registerExtensions(): Promise<void> {
        SetupService.getInstance().registerSetupStep(
            new SetupStep('setup-system-settings', 'Translatable#System', 'setup-system-settings',
                [
                    new UIComponentPermission('system/config', [CRUD.READ])
                ],
                'Translatable#System Settings', 'Translatable#setup_assistant_system_settings_text',
                'kix-icon-gears', 5
            )
        );
    }

    private async registerContextIfNeeded(): Promise<void> {
        const contextDescriptor = new ContextDescriptor(
            AdminContext.CONTEXT_ID, this.contextObjectTypes, ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'admin', ['admin'], AdminContext
        );
        const adminModules = await AdministrationSocketClient.getInstance().loadAdminCategories().catch(() => []);
        if (adminModules.length) {
            ContextService.getInstance().registerContext(contextDescriptor);
        }
    }

    private async checkAdminModuleAllowed(): Promise<boolean> {
        const currentUser = await AgentSocketClient.getInstance().getCurrentUser();
        let allowed = currentUser.UserID === 1;
        if (!allowed && Array.isArray(currentUser.RoleIDs)) {
            const agentPortalConfig = await SysConfigService.getInstance().getPortalConfiguration()
                .catch(() => null);
            if (agentPortalConfig?.adminRoleIds?.length) {
                for (const roleId of currentUser.RoleIDs) {
                    if (agentPortalConfig?.adminRoleIds.some((rid) => rid === roleId)) {
                        allowed = true;
                        break;
                    }
                }
            }
        }

        return allowed;
    }

}
