import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ServiceRegistry, LabelService, FactoryService, ActionFactory, ContextService
} from '../../../core/browser';
import {
    RoleService, RoleTableFactory, RoleBrowserFactory, RoleLabelProvider, UserRoleCreateAction,
    NewUserRoleDialogContext, UserLabelProvider, UserBrowserFactory,
    UserRoleEditAction, RoleDetailsContext, UserTableFactory,
    UserCreateAction, NewUserDialogContext, UserDetailsContext, UserEditAction, UserFormService, EditUserDialogContext,
    EditUserRoleDialogContext, UserRoleFormService
} from '../../../core/browser/user';
import {
    KIXObjectType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, WidgetSize, ContextDescriptor,
    ContextType,
    CRUD
} from '../../../core/model';
import { TableFactoryService, TableCSSHandlerRegistry } from '../../../core/browser/table';
import { DialogService } from '../../../core/browser/components/dialog';
import { PermissionTypeBrowserFactory } from '../../../core/browser/permission';
import { PermissionTableCSSHandler } from '../../../core/browser/application';
import { AuthenticationSocketClient } from '../../../core/browser/application/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../core/model/UIComponentPermission';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(RoleService.getInstance());
        ServiceRegistry.registerServiceInstance(UserFormService.getInstance());

        LabelService.getInstance().registerLabelProvider(new UserLabelProvider());
        LabelService.getInstance().registerLabelProvider(new RoleLabelProvider());

        ServiceRegistry.registerServiceInstance(UserRoleFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new RoleTableFactory());
        TableFactoryService.getInstance().registerFactory(new UserTableFactory());
        TableCSSHandlerRegistry.getInstance().registerCSSHandler(
            KIXObjectType.PERMISSION, new PermissionTableCSSHandler()
        );

        FactoryService.getInstance().registerFactory(KIXObjectType.USER, UserBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(KIXObjectType.ROLE, RoleBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.PERMISSION_TYPE, PermissionTypeBrowserFactory.getInstance()
        );

        this.registerUser();
        this.registerRole();
    }

    private async registerUser(): Promise<void> {

        if (await this.checkPermission('users', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('user-admin-user-create-action', UserCreateAction);

            const newUserContext = new ContextDescriptor(
                NewUserDialogContext.CONTEXT_ID, [KIXObjectType.USER],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-user-dialog', ['users'], NewUserDialogContext
            );
            ContextService.getInstance().registerContext(newUserContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-user-dialog',
                new WidgetConfiguration(
                    'new-user-dialog', 'Translatable#New Agent', [], {},
                    false, false, WidgetSize.BOTH, 'kix-icon-new-gear'
                ),
                KIXObjectType.USER,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('users/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('user-admin-user-edit-action', UserEditAction);

            const editUserContext = new ContextDescriptor(
                EditUserDialogContext.CONTEXT_ID, [KIXObjectType.USER],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-user-dialog', ['users'], EditUserDialogContext
            );
            ContextService.getInstance().registerContext(editUserContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-user-dialog',
                new WidgetConfiguration(
                    'edit-user-dialog', 'Translatable#Edit Agent', [], {},
                    false, false, WidgetSize.BOTH, 'kix-icon-edit'
                ),
                KIXObjectType.USER,
                ContextMode.EDIT_ADMIN
            ));
        }

        const userDetailsContextDescriptor = new ContextDescriptor(
            UserDetailsContext.CONTEXT_ID, [KIXObjectType.USER],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['users'], UserDetailsContext
        );
        ContextService.getInstance().registerContext(userDetailsContextDescriptor);
    }

    private async registerRole(): Promise<void> {

        if (await this.checkPermission('system/roles', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('user-admin-role-create-action', UserRoleCreateAction);

            const newUserRoleContext = new ContextDescriptor(
                NewUserRoleDialogContext.CONTEXT_ID, [KIXObjectType.ROLE],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-user-role-dialog', ['roles'], NewUserRoleDialogContext
            );
            ContextService.getInstance().registerContext(newUserRoleContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-user-role-dialog',
                new WidgetConfiguration(
                    'new-user-role-dialog', 'Translatable#New Role', [], {},
                    false, false, WidgetSize.BOTH, 'kix-icon-new-gear'
                ),
                KIXObjectType.ROLE,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/roles/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('user-admin-role-edit-action', UserRoleEditAction);

            const editUserRoleContext = new ContextDescriptor(
                EditUserRoleDialogContext.CONTEXT_ID, [KIXObjectType.ROLE],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-user-role-dialog', ['roles'], EditUserRoleDialogContext
            );
            ContextService.getInstance().registerContext(editUserRoleContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-user-role-dialog',
                new WidgetConfiguration(
                    'edit-user-role-dialog', 'Translatable#Edit Role', [], {},
                    false, false, WidgetSize.BOTH, 'kix-icon-edit'
                ),
                KIXObjectType.ROLE,
                ContextMode.EDIT_ADMIN
            ));
        }

        const roleDetailsContextDescriptor = new ContextDescriptor(
            RoleDetailsContext.CONTEXT_ID, [KIXObjectType.ROLE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['roles'], RoleDetailsContext
        );
        ContextService.getInstance().registerContext(roleDetailsContextDescriptor);
    }

    private async checkPermission(resource: string, crud: CRUD): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, [crud])]
        );
    }

}

module.exports = Component;
