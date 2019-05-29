import {
    AbstractMarkoComponent, LabelService, ServiceRegistry,
    FactoryService, ContextService, ActionFactory, KIXObjectSearchService, TableFactoryService
} from '../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, WidgetConfiguration,
    ConfiguredDialogWidget, WidgetSize
} from '../../../core/model';
import { ImportService } from '../../../core/browser/import';
import { DialogService } from '../../../core/browser/components/dialog';
import {
    OrganisationFormService, OrganisationTableFactory, OrganisationLabelProvider, OrganisationService,
    OrganisationBrowserFactory, OrganisationSearchDefinition, OrganisationImportManager,
    OrganisationImportDialogContext, OrganisationSearchContext, EditOrganisationDialogContext,
    NewOrganisationDialogContext, OrganisationDetailsContext, OrganisationContext, OrganisationSearchAction,
    OrganisationCreateAction, OrganisationEditAction, OrganisationCreateContactAction,
    OrganisationPrintAction, OrganisationCreateCIAction, OrganisationCreateTicketAction
} from '../../../core/browser/organisation';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(OrganisationService.getInstance());
        ServiceRegistry.registerServiceInstance(OrganisationFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new OrganisationTableFactory());
        LabelService.getInstance().registerLabelProvider(new OrganisationLabelProvider());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.ORGANISATION, OrganisationBrowserFactory.getInstance()
        );
        KIXObjectSearchService.getInstance().registerSearchDefinition(new OrganisationSearchDefinition());

        ImportService.getInstance().registerImportManager(new OrganisationImportManager());

        this.registerContexts();
        this.registerDialogs();
        this.registerActions();
    }

    private registerContexts(): void {
        const organisationListContext = new ContextDescriptor(
            OrganisationContext.CONTEXT_ID, [KIXObjectType.ORGANISATION], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'organisations', ['organisations', 'contacts'], OrganisationContext
        );
        ContextService.getInstance().registerContext(organisationListContext);

        const organisationDetailsContext = new ContextDescriptor(
            OrganisationDetailsContext.CONTEXT_ID, [KIXObjectType.ORGANISATION], ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['organisations'], OrganisationDetailsContext
        );
        ContextService.getInstance().registerContext(organisationDetailsContext);

        const newOrganisationContext = new ContextDescriptor(
            NewOrganisationDialogContext.CONTEXT_ID, [KIXObjectType.ORGANISATION],
            ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-organisation-dialog', ['organisations'], NewOrganisationDialogContext
        );
        ContextService.getInstance().registerContext(newOrganisationContext);

        const editOrganisationContext = new ContextDescriptor(
            EditOrganisationDialogContext.CONTEXT_ID, [KIXObjectType.ORGANISATION],
            ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-organisation-dialog', ['organisations'], EditOrganisationDialogContext
        );
        ContextService.getInstance().registerContext(editOrganisationContext);

        const searchContactContext = new ContextDescriptor(
            OrganisationSearchContext.CONTEXT_ID, [KIXObjectType.ORGANISATION], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-organisation-dialog', ['organisations'], OrganisationSearchContext
        );
        ContextService.getInstance().registerContext(searchContactContext);

        const organisationImportDialogContext = new ContextDescriptor(
            OrganisationImportDialogContext.CONTEXT_ID, [KIXObjectType.ORGANISATION],
            ContextType.DIALOG, ContextMode.IMPORT,
            false, 'import-dialog', ['organisations'], OrganisationImportDialogContext
        );
        ContextService.getInstance().registerContext(organisationImportDialogContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-organisation-dialog',
            new WidgetConfiguration(
                'new-organisation-dialog', 'Translatable#New Organisation', [], {},
                false, false, null, 'kix-icon-man-house-new'
            ),
            KIXObjectType.ORGANISATION,
            ContextMode.CREATE
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-organisation-dialog',
            new WidgetConfiguration(
                'edit-organisation-dialog', 'Translatable#Edit Organisation', [], {},
                false, false, null, 'kix-icon-edit'
            ),
            KIXObjectType.ORGANISATION,
            ContextMode.EDIT
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'search-organisation-dialog',
            new WidgetConfiguration(
                'search-organisation-dialog', 'Translatable#Organisation Search', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-search-man-house'
            ),
            KIXObjectType.ORGANISATION,
            ContextMode.SEARCH
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'organisation-import-dialog',
            new WidgetConfiguration(
                'import-dialog', 'Translatable#Import Organisations', [], {},
                false, false, null, 'kix-icon-man-house-new'
            ),
            KIXObjectType.ORGANISATION,
            ContextMode.IMPORT
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('organisation-search-action', OrganisationSearchAction);
        ActionFactory.getInstance().registerAction('organisation-create-action', OrganisationCreateAction);
        ActionFactory.getInstance().registerAction('organisation-edit-action', OrganisationEditAction);
        ActionFactory.getInstance().registerAction(
            'organisation-create-contact-action', OrganisationCreateContactAction
        );
        ActionFactory.getInstance().registerAction('organisation-print-action', OrganisationPrintAction);
        ActionFactory.getInstance().registerAction('organisation-create-ci-action', OrganisationCreateCIAction);
        ActionFactory.getInstance().registerAction('organisation-create-ticket-action', OrganisationCreateTicketAction);
    }

}

module.exports = Component;
