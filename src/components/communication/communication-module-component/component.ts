import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ServiceRegistry, LabelService, FactoryService, ActionFactory, ContextService, DialogService
} from '../../../core/browser';
import {
    KIXObjectType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, ContextDescriptor, ContextType
} from '../../../core/model';
import { TableFactoryService } from '../../../core/browser/table';
import {
    SystemAddressCreateAction, SystemAddressService, SystemAddressFormService, SystemAddressBrowserFactory,
    SystemAddressTableFactory, SystemAddressLabelProvider, NewSystemAddressDialogContext, SystemAddressDetailsContext,
    EditSystemAddressDialogContext, SystemAddressEditAction, SystemAddressDeleteTableAction
} from '../../../core/browser/system-address';
import {
    MailAccountService, MailAccountBrowserFactory, MailAccountTableFactory, MailAccountLabelProvider
} from '../../../core/browser/mail-account';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(SystemAddressService.getInstance());
        ServiceRegistry.registerServiceInstance(SystemAddressFormService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.SYSTEM_ADDRESS, SystemAddressBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new SystemAddressTableFactory());
        LabelService.getInstance().registerLabelProvider(new SystemAddressLabelProvider());

        ServiceRegistry.registerServiceInstance(MailAccountService.getInstance());
        // ServiceRegistry.registerServiceInstance(MailAccountFormService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.MAIL_ACCOUNT, MailAccountBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new MailAccountTableFactory());
        LabelService.getInstance().registerLabelProvider(new MailAccountLabelProvider());

        this.registerAdminContexts();
        this.registerAdminActions();
        this.registerAdminDialogs();
    }

    private registerAdminContexts(): void {
        const newSystemAddressDialogContext = new ContextDescriptor(
            NewSystemAddressDialogContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-system-address-dialog', ['system-addresses'], NewSystemAddressDialogContext
        );
        ContextService.getInstance().registerContext(newSystemAddressDialogContext);

        const systemAddressDetailsContext = new ContextDescriptor(
            SystemAddressDetailsContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['system-addresses'], SystemAddressDetailsContext
        );
        ContextService.getInstance().registerContext(systemAddressDetailsContext);

        const editSystemAddressDialogContext = new ContextDescriptor(
            EditSystemAddressDialogContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-system-address-dialog', ['system-addresses'], EditSystemAddressDialogContext
        );
        ContextService.getInstance().registerContext(editSystemAddressDialogContext);
    }

    private registerAdminActions(): void {
        ActionFactory.getInstance().registerAction(
            'system-address-create', SystemAddressCreateAction
        );
        ActionFactory.getInstance().registerAction(
            'system-addresses-table-delete', SystemAddressDeleteTableAction
        );
        ActionFactory.getInstance().registerAction(
            'system-address-edit', SystemAddressEditAction
        );
    }

    private registerAdminDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-system-address-dialog',
            new WidgetConfiguration(
                'new-system-address-dialog', 'Translatable#New Address',
                [], {}, false, false, null, 'kix-icon-new-gear'
            ),
            KIXObjectType.SYSTEM_ADDRESS,
            ContextMode.CREATE_ADMIN
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-system-address-dialog',
            new WidgetConfiguration(
                'edit-system-address-dialog', 'Translatable#Edit Address',
                [], {}, false, false, null, 'kix-icon-edit'
            ),
            KIXObjectType.SYSTEM_ADDRESS,
            ContextMode.EDIT_ADMIN
        ));
    }
}

module.exports = Component;
