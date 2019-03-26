import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ServiceRegistry, LabelService, FactoryService, ActionFactory, ContextService
} from '../../../core/browser';
import {
    RoleService, RoleTableFactory, RoleBrowserFactory, RoleLabelProvider, UserRoleCreateAction,
    NewUserRoleDialogContext, UserRoleTableDeleteAction, UserLabelProvider, UserBrowserFactory,
    UserRoleEditAction, RoleDetailsContext, UserTableFactory, RolePermissionsTableFactory, PermissionTableCSSHandler,
    UserCreateAction,
    NewUserDialogContext,
    UserDetailsContext,
    UserEditAction
} from '../../../core/browser/user';
import {
    KIXObjectType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, WidgetSize, ContextDescriptor, ContextType
} from '../../../core/model';
import { TableFactoryService, TableCSSHandlerRegistry } from '../../../core/browser/table';
import { DialogService } from '../../../core/browser/components/dialog';
import { PermissionTypeBrowserFactory } from '../../../core/browser/permission';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(RoleService.getInstance());

        LabelService.getInstance().registerLabelProvider(new UserLabelProvider());
        LabelService.getInstance().registerLabelProvider(new RoleLabelProvider());

        TableFactoryService.getInstance().registerFactory(new RoleTableFactory());
        TableFactoryService.getInstance().registerFactory(new UserTableFactory());
        TableFactoryService.getInstance().registerFactory(new RolePermissionsTableFactory());
        TableCSSHandlerRegistry.getInstance().registerCSSHandler(
            KIXObjectType.PERMISSION, new PermissionTableCSSHandler()
        );

        FactoryService.getInstance().registerFactory(KIXObjectType.USER, UserBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(KIXObjectType.ROLE, RoleBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.PERMISSION_TYPE, PermissionTypeBrowserFactory.getInstance()
        );

        this.registerAdminContexts();
        this.registerAdminActions();
        this.registerAdminDialogs();
    }

    private registerAdminContexts(): void {
        const newUserRoleContext = new ContextDescriptor(
            NewUserRoleDialogContext.CONTEXT_ID, [KIXObjectType.ROLE],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-user-role-dialog', ['roles'], NewUserRoleDialogContext
        );
        ContextService.getInstance().registerContext(newUserRoleContext);

        const roleDetailsContextDescriptor = new ContextDescriptor(
            RoleDetailsContext.CONTEXT_ID, [KIXObjectType.ROLE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'user-role-details', ['roles'], RoleDetailsContext
        );
        ContextService.getInstance().registerContext(roleDetailsContextDescriptor);

        const newUserContext = new ContextDescriptor(
            NewUserDialogContext.CONTEXT_ID, [KIXObjectType.USER],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-user-dialog', ['users'], NewUserDialogContext
        );
        ContextService.getInstance().registerContext(newUserContext);

        const userDetailsContextDescriptor = new ContextDescriptor(
            UserDetailsContext.CONTEXT_ID, [KIXObjectType.USER],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['users'], UserDetailsContext
        );
        ContextService.getInstance().registerContext(userDetailsContextDescriptor);
    }

    private registerAdminActions(): void {
        ActionFactory.getInstance().registerAction('user-admin-role-create-action', UserRoleCreateAction);
        ActionFactory.getInstance().registerAction('user-admin-role-edit-action', UserRoleEditAction);
        ActionFactory.getInstance().registerAction('user-admin-role-table-delete-action', UserRoleTableDeleteAction);
        ActionFactory.getInstance().registerAction('user-admin-user-create-action', UserCreateAction);
        ActionFactory.getInstance().registerAction('user-admin-user-edit-action', UserEditAction);
    }

    private registerAdminDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-user-role-dialog',
            new WidgetConfiguration(
                'new-user-role-dialog', 'Translatable#New Role', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-new-gear'
            ),
            KIXObjectType.ROLE,
            ContextMode.CREATE_ADMIN
        ));

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
}

module.exports = Component;
