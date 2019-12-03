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
import { KIXObjectType, ContextDescriptor, ContextType, ContextMode } from '../../../../core/model';
import {
    OrganisationFormService, OrganisationTableFactory, OrganisationLabelProvider, OrganisationService,
    OrganisationBrowserFactory, OrganisationSearchDefinition, OrganisationSearchContext,
    OrganisationDetailsContext, OrganisationSearchAction, OrganisationPlaceholderHandler
} from '../../../../core/browser/organisation';
import { SearchService } from '../../../../core/browser/kix/search/SearchService';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 302;

    public name: string = 'OrganisationReadUIModule';

    public unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        PlaceholderService.getInstance().registerPlaceholderHandler(new OrganisationPlaceholderHandler());

        ServiceRegistry.registerServiceInstance(OrganisationService.getInstance());
        ServiceRegistry.registerServiceInstance(OrganisationFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new OrganisationTableFactory());
        LabelService.getInstance().registerLabelProvider(new OrganisationLabelProvider());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.ORGANISATION, OrganisationBrowserFactory.getInstance()
        );
        SearchService.getInstance().registerSearchDefinition(new OrganisationSearchDefinition());

        await this.registerContexts();
        this.registerActions();
    }

    private async registerContexts(): Promise<void> {
        const organisationDetailsContext = new ContextDescriptor(
            OrganisationDetailsContext.CONTEXT_ID, [KIXObjectType.ORGANISATION], ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['organisations'], OrganisationDetailsContext
        );
        await ContextService.getInstance().registerContext(organisationDetailsContext);

        const searchContactContext = new ContextDescriptor(
            OrganisationSearchContext.CONTEXT_ID, [KIXObjectType.ORGANISATION], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-organisation-dialog', ['organisations'], OrganisationSearchContext
        );
        await ContextService.getInstance().registerContext(searchContactContext);
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('organisation-search-action', OrganisationSearchAction);
    }

}
