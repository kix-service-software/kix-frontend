/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { PlaceholderService } from '../../../../modules/base-components/webapp/core/PlaceholderService';
import { UserPlaceholderHandler } from './UserPlaceholderHandler';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import {
    RoleService, UserRoleFormService, RoleTableFactory, UserTableFactory, UserCreateAction,
    UserEditAction, UserDetailsContext, UserRoleCreateAction, NewUserRoleDialogContext,
    UserRoleEditAction, EditUserRoleDialogContext, RoleDetailsContext
} from './admin';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { UserLabelProvider } from './UserLabelProvider';
import { RoleLabelProvider } from './RoleLabelProvider';
import { TableFactoryService, TableCSSHandlerRegistry } from '../../../base-components/webapp/core/table';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { PermissionTableCSSHandler } from './PermissionTableCSSHandler';
import { PermissionsTableFactory } from './PermissionsTableFactory';
import { PermissionLabelProvider } from './PermissionLabelProvider';
import { PersonalSettingsDialogContext } from './PersonalSettingsDialogContext';
import { UserPasswordValidator } from './UserPasswordValidator';
import { FormValidationService } from '../../../../modules/base-components/webapp/core/FormValidationService';
import { AgentService } from './AgentService';
import { PersonalSettingsFormService } from './PersonalSettingsFormService';
import { SetupService } from '../../../setup-assistant/webapp/core/SetupService';
import { SetupStep } from '../../../setup-assistant/webapp/core/SetupStep';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';


export class UIModule implements IUIModule {

    public name: string = 'UserUIModule';

    public priority: number = 50;

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        PlaceholderService.getInstance().registerPlaceholderHandler(new UserPlaceholderHandler());

        ServiceRegistry.registerServiceInstance(AgentService.getInstance());
        ServiceRegistry.registerServiceInstance(RoleService.getInstance());
        ServiceRegistry.registerServiceInstance(PersonalSettingsFormService.getInstance());

        LabelService.getInstance().registerLabelProvider(new UserLabelProvider());
        LabelService.getInstance().registerLabelProvider(new RoleLabelProvider());
        LabelService.getInstance().registerLabelProvider(new PermissionLabelProvider());

        ServiceRegistry.registerServiceInstance(UserRoleFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new RoleTableFactory());
        TableFactoryService.getInstance().registerFactory(new UserTableFactory());
        TableCSSHandlerRegistry.getInstance().registerObjectCSSHandler(
            KIXObjectType.PERMISSION, new PermissionTableCSSHandler()
        );
        TableFactoryService.getInstance().registerFactory(new PermissionsTableFactory());

        const settingsDialogContext = new ContextDescriptor(
            PersonalSettingsDialogContext.CONTEXT_ID, [KIXObjectType.PERSONAL_SETTINGS],
            ContextType.DIALOG, ContextMode.PERSONAL_SETTINGS,
            false, 'personal-settings-dialog', ['personal-settings'], PersonalSettingsDialogContext
        );
        ContextService.getInstance().registerContext(settingsDialogContext);

        this.registerUser();
        this.registerRole();

        FormValidationService.getInstance().registerValidator(new UserPasswordValidator());

        SetupService.getInstance().registerSetupStep(
            new SetupStep(
                'SuperUserAccount', 'Translatable#Superuser Account', 'setup-superuser',
                [
                    new UIComponentPermission('contacts', [CRUD.CREATE]),
                    new UIComponentPermission('system/users', [CRUD.CREATE])
                ],
                'Translatable#Create Superuser Account', 'Translatable#setup_assistant_create_superuser_text',
                'kix-icon-man', 10
            )
        );

        SetupService.getInstance().registerSetupStep(
            new SetupStep(
                'Mail', 'Translatable#Admin Password', 'setup-admin-password',
                [
                    new UIComponentPermission('system/users/1', [CRUD.UPDATE])
                ],
                'Translatable#Set Password for admin', 'Translatable#setup_assistant_change_admin_password_text',
                'kix-icon-admin', 20
            )
        );
    }

    private registerUser(): void {
        ActionFactory.getInstance().registerAction('user-admin-user-create-action', UserCreateAction);
        ActionFactory.getInstance().registerAction('user-admin-user-edit-action', UserEditAction);

        const userDetailsContextDescriptor = new ContextDescriptor(
            UserDetailsContext.CONTEXT_ID, [KIXObjectType.USER, KIXObjectType.CONTACT],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['users'], UserDetailsContext,
            [
                new UIComponentPermission('system/users', [CRUD.READ])
            ]
        );
        ContextService.getInstance().registerContext(userDetailsContextDescriptor);
    }

    private registerRole(): void {

        ActionFactory.getInstance().registerAction('user-admin-role-create-action', UserRoleCreateAction);

        const newUserRoleContext = new ContextDescriptor(
            NewUserRoleDialogContext.CONTEXT_ID, [KIXObjectType.ROLE],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-user-role-dialog', ['roles'], NewUserRoleDialogContext,
            [
                new UIComponentPermission('system/roles', [CRUD.CREATE])
            ]
        );
        ContextService.getInstance().registerContext(newUserRoleContext);

        ActionFactory.getInstance().registerAction('user-admin-role-edit-action', UserRoleEditAction);

        const editUserRoleContext = new ContextDescriptor(
            EditUserRoleDialogContext.CONTEXT_ID, [KIXObjectType.ROLE],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-user-role-dialog', ['roles'], EditUserRoleDialogContext,
            [
                new UIComponentPermission('system/roles', [CRUD.CREATE])
            ]
        );
        ContextService.getInstance().registerContext(editUserRoleContext);

        const roleDetailsContextDescriptor = new ContextDescriptor(
            RoleDetailsContext.CONTEXT_ID, [KIXObjectType.ROLE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['roles'], RoleDetailsContext,
            [
                new UIComponentPermission('system/roles', [CRUD.READ])
            ]
        );
        ContextService.getInstance().registerContext(roleDetailsContextDescriptor);
    }

}
