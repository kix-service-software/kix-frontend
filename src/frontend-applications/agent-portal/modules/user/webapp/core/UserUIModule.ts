/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../../../model/IUIModule";
import { PlaceholderService } from "../../../../modules/base-components/webapp/core/PlaceholderService";
import { UserPlaceholderHandler } from "./UserPlaceholderHandler";
import { ServiceRegistry } from "../../../../modules/base-components/webapp/core/ServiceRegistry";
import {
    RoleService, UserRoleFormService, RoleTableFactory, UserTableFactory, UserCreateAction, NewUserDialogContext,
    UserEditAction, EditUserDialogContext, UserDetailsContext, UserRoleCreateAction, NewUserRoleDialogContext,
    UserRoleEditAction, EditUserRoleDialogContext, RoleDetailsContext
} from "./admin";
import { UserFormService } from "./UserFormService";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { UserLabelProvider } from "./UserLabelProvider";
import { RoleLabelProvider } from "./RoleLabelProvider";
import { TableFactoryService, TableCSSHandlerRegistry } from "../../../base-components/webapp/core/table";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { FactoryService } from "../../../../modules/base-components/webapp/core/FactoryService";
import { UserBrowserFactory } from "./UserBrowserFactory";
import { RoleBrowserFactory } from "./RoleBrowserFactory";
import { ActionFactory } from "../../../../modules/base-components/webapp/core/ActionFactory";
import { ContextDescriptor } from "../../../../model/ContextDescriptor";
import { ContextType } from "../../../../model/ContextType";
import { ContextMode } from "../../../../model/ContextMode";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { PermissionTableCSSHandler } from "./PermissionTableCSSHandler";
import { PermissionTypeBrowserFactory } from "./PermissionTypeBrowserFactory";
import { PermissionsTableFactory } from "./PermissionsTableFactory";
import { PermissionLabelProvider } from "./PermissionLabelProvider";
import { PersonalSettingsDialogContext } from "./PersonalSettingsDialogContext";
import { UserPasswordValidator } from "./UserPasswordValidator";
import { FormValidationService } from "../../../../modules/base-components/webapp/core/FormValidationService";
import { AgentService } from "./AgentService";


export class UIModule implements IUIModule {

    public name: string = 'UserUIUIModule';

    public priority: number = 50;

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        PlaceholderService.getInstance().registerPlaceholderHandler(new UserPlaceholderHandler());

        ServiceRegistry.registerServiceInstance(AgentService.getInstance());
        ServiceRegistry.registerServiceInstance(RoleService.getInstance());
        ServiceRegistry.registerServiceInstance(UserFormService.getInstance());

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

        FactoryService.getInstance().registerFactory(KIXObjectType.USER, UserBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(KIXObjectType.ROLE, RoleBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.PERMISSION_TYPE, PermissionTypeBrowserFactory.getInstance()
        );

        const settingsDialogContext = new ContextDescriptor(
            PersonalSettingsDialogContext.CONTEXT_ID, [KIXObjectType.PERSONAL_SETTINGS],
            ContextType.DIALOG, ContextMode.PERSONAL_SETTINGS,
            false, 'personal-settings-dialog', ['personal-settings'], PersonalSettingsDialogContext
        );
        await ContextService.getInstance().registerContext(settingsDialogContext);

        await this.registerUser();
        await this.registerRole();

        FormValidationService.getInstance().registerValidator(new UserPasswordValidator());
    }

    private async registerUser(): Promise<void> {

        ActionFactory.getInstance().registerAction('user-admin-user-create-action', UserCreateAction);

        const newUserContext = new ContextDescriptor(
            NewUserDialogContext.CONTEXT_ID, [KIXObjectType.USER],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-user-dialog', ['users'], NewUserDialogContext
        );
        await ContextService.getInstance().registerContext(newUserContext);

        ActionFactory.getInstance().registerAction('user-admin-user-edit-action', UserEditAction);

        const editUserContext = new ContextDescriptor(
            EditUserDialogContext.CONTEXT_ID, [KIXObjectType.USER],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-user-dialog', ['users'], EditUserDialogContext
        );
        await ContextService.getInstance().registerContext(editUserContext);

        const userDetailsContextDescriptor = new ContextDescriptor(
            UserDetailsContext.CONTEXT_ID, [KIXObjectType.USER],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['users'], UserDetailsContext
        );
        await ContextService.getInstance().registerContext(userDetailsContextDescriptor);
    }

    private async registerRole(): Promise<void> {

        ActionFactory.getInstance().registerAction('user-admin-role-create-action', UserRoleCreateAction);

        const newUserRoleContext = new ContextDescriptor(
            NewUserRoleDialogContext.CONTEXT_ID, [KIXObjectType.ROLE],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-user-role-dialog', ['roles'], NewUserRoleDialogContext
        );
        await ContextService.getInstance().registerContext(newUserRoleContext);

        ActionFactory.getInstance().registerAction('user-admin-role-edit-action', UserRoleEditAction);

        const editUserRoleContext = new ContextDescriptor(
            EditUserRoleDialogContext.CONTEXT_ID, [KIXObjectType.ROLE],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-user-role-dialog', ['roles'], EditUserRoleDialogContext
        );
        await ContextService.getInstance().registerContext(editUserRoleContext);

        const roleDetailsContextDescriptor = new ContextDescriptor(
            RoleDetailsContext.CONTEXT_ID, [KIXObjectType.ROLE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['roles'], RoleDetailsContext
        );
        await ContextService.getInstance().registerContext(roleDetailsContextDescriptor);
    }

}
