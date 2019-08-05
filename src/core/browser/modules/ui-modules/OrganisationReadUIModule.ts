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
import { DialogService } from '../../../../core/browser/components/dialog';
import {
    OrganisationFormService, OrganisationTableFactory, OrganisationLabelProvider, OrganisationService,
    OrganisationBrowserFactory, OrganisationSearchDefinition, OrganisationSearchContext,
    OrganisationDetailsContext, OrganisationSearchAction, OrganisationPlaceholderHandler
} from '../../../../core/browser/organisation';
import { SearchService } from '../../../../core/browser/kix/search/SearchService';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 302;

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

        this.registerContexts();
        this.registerDialogs();
        this.registerActions();
    }

    private registerContexts(): void {
        const organisationDetailsContext = new ContextDescriptor(
            OrganisationDetailsContext.CONTEXT_ID, [KIXObjectType.ORGANISATION], ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['organisations'], OrganisationDetailsContext
        );
        ContextService.getInstance().registerContext(organisationDetailsContext);

        const searchContactContext = new ContextDescriptor(
            OrganisationSearchContext.CONTEXT_ID, [KIXObjectType.ORGANISATION], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-organisation-dialog', ['organisations'], OrganisationSearchContext
        );
        ContextService.getInstance().registerContext(searchContactContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'search-organisation-dialog',
            new WidgetConfiguration(
                'search-organisation-dialog', 'Translatable#Organisation Search', [], {},
                false, false, 'kix-icon-search-man-house'
            ),
            KIXObjectType.ORGANISATION,
            ContextMode.SEARCH
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('organisation-search-action', OrganisationSearchAction);
    }

}
