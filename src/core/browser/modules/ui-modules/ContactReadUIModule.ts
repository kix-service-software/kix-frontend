/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
    ContactSearchContext, ContactSearchAction, ContactSearchDefinition, ContactFormService, ContactPlaceholderHandler,
    ContactCSVExportAction
} from '../../../../core/browser/contact';
import { DialogService } from '../../../../core/browser/components/dialog';
import { SearchService } from '../../../../core/browser/kix/search/SearchService';
import { IUIModule } from '../../application/IUIModule';
import { ContactTableDependingAction } from '../../organisation';

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
        SearchService.getInstance().registerSearchDefinition(new ContactSearchDefinition());

        await this.registerContexts();
        this.registerActions();
    }

    private async registerContexts(): Promise<void> {
        const organisationDetailsContext = new ContextDescriptor(
            ContactDetailsContext.CONTEXT_ID, [KIXObjectType.CONTACT], ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['contacts'], ContactDetailsContext
        );
        await ContextService.getInstance().registerContext(organisationDetailsContext);

        const searchContactContext = new ContextDescriptor(
            ContactSearchContext.CONTEXT_ID, [KIXObjectType.CONTACT], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-contact-dialog', ['contacts'], ContactSearchContext
        );
        await ContextService.getInstance().registerContext(searchContactContext);
    }


    private registerActions(): void {
        ActionFactory.getInstance().registerAction('contact-search-action', ContactSearchAction);
        ActionFactory.getInstance().registerAction('contact-csv-export-action', ContactCSVExportAction);
        ActionFactory.getInstance().registerAction('contact-table-depending-action', ContactTableDependingAction);
    }

}
