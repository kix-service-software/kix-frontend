import {
    LabelService, ServiceRegistry, FactoryService, ContextService,
    ActionFactory, TableFactoryService, PlaceholderService
} from '../../../../core/browser';
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, WidgetConfiguration,
    ConfiguredDialogWidget
} from '../../../../core/model';
import {
    ContactTableFactory, ContactLabelProvider, ContactService, ContactBrowserFactory, ContactDetailsContext,
    ContactSearchContext, ContactSearchAction, ContactCreateOrganisationAction,
    ContactCreateTicketAction, ContactCreateCIAction, ContactSearchDefinition, ContactFormService,
    ContactPlaceholderHandler
} from '../../../../core/browser/contact';
import { DialogService } from '../../../../core/browser/components/dialog';
import { KIXObjectSearchService } from '../../../../core/browser/kix/search/KIXObjectSearchService';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 303;

    public unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        PlaceholderService.getInstance().registerPlaceholderHandler(new ContactPlaceholderHandler());

        ServiceRegistry.registerServiceInstance(ContactService.getInstance());
        ServiceRegistry.registerServiceInstance(ContactFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new ContactTableFactory());
        LabelService.getInstance().registerLabelProvider(new ContactLabelProvider());
        FactoryService.getInstance().registerFactory(KIXObjectType.CONTACT, ContactBrowserFactory.getInstance());
        KIXObjectSearchService.getInstance().registerSearchDefinition(new ContactSearchDefinition());

        this.registerContexts();
        this.registerDialogs();
        this.registerActions();
    }

    private registerContexts(): void {
        const organisationDetailsContext = new ContextDescriptor(
            ContactDetailsContext.CONTEXT_ID, [KIXObjectType.CONTACT], ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['contacts'], ContactDetailsContext
        );
        ContextService.getInstance().registerContext(organisationDetailsContext);

        const searchContactContext = new ContextDescriptor(
            ContactSearchContext.CONTEXT_ID, [KIXObjectType.CONTACT], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-contact-dialog', ['contacts'], ContactSearchContext
        );
        ContextService.getInstance().registerContext(searchContactContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'search-contact-dialog',
            new WidgetConfiguration(
                'search-contact-dialog',
                'Translatable#Contact Search',
                [],
                {},
                false,
                false,
                'kix-icon-search-man-bubble'
            ),
            KIXObjectType.CONTACT,
            ContextMode.SEARCH
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('contact-search-action', ContactSearchAction);
        ActionFactory.getInstance().registerAction('contact-create-contact-action', ContactCreateOrganisationAction);
        ActionFactory.getInstance().registerAction('contact-create-ci-action', ContactCreateCIAction);
        ActionFactory.getInstance().registerAction('contact-create-ticket-action', ContactCreateTicketAction);
        ActionFactory.getInstance().registerAction(
            'contact-create-organisation-action', ContactCreateOrganisationAction
        );
    }

}
