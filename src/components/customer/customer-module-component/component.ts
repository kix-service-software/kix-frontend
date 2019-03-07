import {
    AbstractMarkoComponent, LabelService, ServiceRegistry,
    FactoryService, ContextService, DialogService, ActionFactory, KIXObjectSearchService, TableFactoryService
} from '../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    CustomerLabelProvider, CustomerBrowserFactory, CustomerContext, CustomerDetailsContext,
    NewCustomerDialogContext, CustomerSearchContext, CustomerSearchAction, CustomerCreateAction,
    CustomerEditAction, CustomerCreateContactAction, CustomerPrintAction, CustomerCreateCIAction,
    CustomerCreateTicketAction, CustomerService, CustomerTableFactory, CustomerSearchDefinition,
    EditCustomerDialogContext, CustomerFormService, CustomerImportManager
} from '../../../core/browser/customer';
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, WidgetConfiguration,
    ConfiguredDialogWidget, WidgetSize, KIXObjectCache, CustomerCacheHandler
} from '../../../core/model';
import { ImportService } from '../../../core/browser/import';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(CustomerService.getInstance());
        ServiceRegistry.registerServiceInstance(CustomerFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new CustomerTableFactory());
        LabelService.getInstance().registerLabelProvider(new CustomerLabelProvider());
        FactoryService.getInstance().registerFactory(KIXObjectType.CUSTOMER, CustomerBrowserFactory.getInstance());
        KIXObjectSearchService.getInstance().registerSearchDefinition(new CustomerSearchDefinition());

        KIXObjectCache.registerCacheHandler(new CustomerCacheHandler());

        ImportService.getInstance().registerImportManager(new CustomerImportManager());

        this.registerContexts();
        this.registerDialogs();
        this.registerActions();
    }

    private registerContexts(): void {
        const customerListContext = new ContextDescriptor(
            CustomerContext.CONTEXT_ID, [KIXObjectType.CUSTOMER], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'customers', ['customers', 'contacts'], CustomerContext
        );
        ContextService.getInstance().registerContext(customerListContext);

        const customerDetailsContext = new ContextDescriptor(
            CustomerDetailsContext.CONTEXT_ID, [KIXObjectType.CUSTOMER], ContextType.MAIN, ContextMode.DETAILS,
            true, 'customer-details', ['customers'], CustomerDetailsContext
        );
        ContextService.getInstance().registerContext(customerDetailsContext);

        const newCustomerContext = new ContextDescriptor(
            NewCustomerDialogContext.CONTEXT_ID, [KIXObjectType.CUSTOMER], ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-customer-dialog', ['customers'], NewCustomerDialogContext
        );
        ContextService.getInstance().registerContext(newCustomerContext);

        const editCustomerContext = new ContextDescriptor(
            EditCustomerDialogContext.CONTEXT_ID, [KIXObjectType.CUSTOMER], ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-customer-dialog', ['customers'], EditCustomerDialogContext
        );
        ContextService.getInstance().registerContext(editCustomerContext);

        const searchContactContext = new ContextDescriptor(
            CustomerSearchContext.CONTEXT_ID, [KIXObjectType.CUSTOMER], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-customer-dialog', ['customers'], CustomerSearchContext
        );
        ContextService.getInstance().registerContext(searchContactContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-customer-dialog',
            new WidgetConfiguration(
                'new-customer-dialog', 'Neuer Kunde', [], {}, false, false, null, 'kix-icon-man-house-new'
            ),
            KIXObjectType.CUSTOMER,
            ContextMode.CREATE
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-customer-dialog',
            new WidgetConfiguration(
                'edit-customer-dialog', 'Kunde Bearbeiten', [], {}, false, false, null, 'kix-icon-edit'
            ),
            KIXObjectType.CUSTOMER,
            ContextMode.EDIT
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'search-customer-dialog',
            new WidgetConfiguration(
                'search-customer-dialog', 'Kundensuche', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-search-man-house'
            ),
            KIXObjectType.CUSTOMER,
            ContextMode.SEARCH
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('customer-search-action', CustomerSearchAction);
        ActionFactory.getInstance().registerAction('customer-create-action', CustomerCreateAction);
        ActionFactory.getInstance().registerAction('customer-edit-action', CustomerEditAction);
        ActionFactory.getInstance().registerAction('customer-create-contact-action', CustomerCreateContactAction);
        ActionFactory.getInstance().registerAction('customer-print-action', CustomerPrintAction);
        ActionFactory.getInstance().registerAction('customer-create-ci-action', CustomerCreateCIAction);
        ActionFactory.getInstance().registerAction('customer-create-ticket-action', CustomerCreateTicketAction);
    }

}

module.exports = Component;
