import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ServiceRegistry, LabelService, FactoryService, ActionFactory, ContextService
} from '../../../core/browser';
import {
    RoleService, RoleTableFactory, RoleBrowserFactory, RoleLabelProvider, UserRoleCreateAction,
    NewUserRoleDialogContext, UserRoleTableDeleteAction, UserLabelProvider, UserBrowserFactory
} from '../../../core/browser/user';
import {
    KIXObjectType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, WidgetSize, ContextDescriptor, ContextType
} from '../../../core/model';
import { TableFactoryService } from '../../../core/browser/table';
import { DialogService } from '../../../core/browser/components/dialog';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(RoleService.getInstance());

        LabelService.getInstance().registerLabelProvider(new UserLabelProvider());
        LabelService.getInstance().registerLabelProvider(new RoleLabelProvider());

        TableFactoryService.getInstance().registerFactory(new RoleTableFactory());

        FactoryService.getInstance().registerFactory(KIXObjectType.USER, UserBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(KIXObjectType.ROLE, RoleBrowserFactory.getInstance());

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

        // const roleDetailsContextDescriptor = new ContextDescriptor(
        //     RoleDetailsContext.CONTEXT_ID, [KIXObjectType.ROLE],
        //     ContextType.MAIN, ContextMode.DETAILS,
        //     true, 'role-details', ['roles'], RoleDetailsContext
        // );
        // ContextService.getInstance().registerContext(roleDetailsContextDescriptor);
    }

    private registerAdminActions(): void {
        ActionFactory.getInstance()
            .registerAction('user-admin-role-create-action', UserRoleCreateAction);
        ActionFactory.getInstance()
            .registerAction('user-admin-role-table-delete-action', UserRoleTableDeleteAction);
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
    }
}

module.exports = Component;
