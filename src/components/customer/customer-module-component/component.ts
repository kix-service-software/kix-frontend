import {
    AbstractMarkoComponent, LabelService, ServiceRegistry,
    FactoryService, ContextService, ActionFactory, KIXObjectSearchService, TableFactoryService
} from '../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    CustomerLabelProvider, CustomerBrowserFactory, CustomerContext, CustomerDetailsContext,
    NewCustomerDialogContext, CustomerSearchContext, CustomerSearchAction, CustomerCreateAction,
    CustomerEditAction, CustomerCreateContactAction, CustomerPrintAction, CustomerCreateCIAction,
    CustomerCreateTicketAction, CustomerService, CustomerTableFactory, CustomerSearchDefinition,
    EditCustomerDialogContext, CustomerFormService, CustomerImportManager, CustomerImportDialogContext
} from '../../../core/browser/customer';
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, WidgetConfiguration,
    ConfiguredDialogWidget, WidgetSize, DialogContextDescriptor
} from '../../../core/model';
import { ImportService } from '../../../core/browser/import';
import { DialogService } from '../../../core/browser/components/dialog';

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

        const newCustomerContext = new DialogContextDescriptor(
            NewCustomerDialogContext.CONTEXT_ID, [KIXObjectType.CUSTOMER], ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-customer-dialog', ['customers'], NewCustomerDialogContext
        );
        ContextService.getInstance().registerContext(newCustomerContext);

        const editCustomerContext = new DialogContextDescriptor(
            EditCustomerDialogContext.CONTEXT_ID, [KIXObjectType.CUSTOMER], ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-customer-dialog', ['customers'], EditCustomerDialogContext
        );
        ContextService.getInstance().registerContext(editCustomerContext);

        const searchContactContext = new DialogContextDescriptor(
            CustomerSearchContext.CONTEXT_ID, [KIXObjectType.CUSTOMER], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-customer-dialog', ['customers'], CustomerSearchContext
        );
        ContextService.getInstance().registerContext(searchContactContext);

        const customerImportDialogContext = new DialogContextDescriptor(
            CustomerImportDialogContext.CONTEXT_ID, [KIXObjectType.CUSTOMER], ContextType.DIALOG, ContextMode.IMPORT,
            false, 'import-dialog', ['customers'], CustomerImportDialogContext
        );
        ContextService.getInstance().registerContext(customerImportDialogContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-customer-dialog',
            new WidgetConfiguration(
                'new-customer-dialog', 'Translatable#New Customer', [], {}, false, false, null, 'kix-icon-man-house-new'
            ),
            KIXObjectType.CUSTOMER,
            ContextMode.CREATE
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-customer-dialog',
            new WidgetConfiguration(
                'edit-customer-dialog', 'Translatable#Edit Customer', [], {}, false, false, null, 'kix-icon-edit'
            ),
            KIXObjectType.CUSTOMER,
            ContextMode.EDIT
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'search-customer-dialog',
            new WidgetConfiguration(
                'search-customer-dialog', 'Translatable#Customer Search', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-search-man-house'
            ),
            KIXObjectType.CUSTOMER,
            ContextMode.SEARCH
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'customer-import-dialog',
            new WidgetConfiguration(
                'import-dialog', 'Translatable#Import Customers', [], {}, false, false, null, 'kix-icon-man-house-new'
            ),
            KIXObjectType.CUSTOMER,
            ContextMode.IMPORT
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
