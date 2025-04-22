/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { PlaceholderService } from '../../../../modules/base-components/webapp/core/PlaceholderService';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { OrganisationTableFactory } from './table/OrganisationTableFactory';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { OrganisationPlaceholderHandler } from './OrganisationPlaceholderHandler';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { OrganisationCSVExportAction } from './actions/OrganisationCSVExportAction';
import { OrganisationSearchAction } from './actions';
import { OrganisationDetailsContext } from './context/OrganisationDetailsContext';
import { OrganisationSearchContext } from './context/OrganisationSearchContext';
import { OrganisationFormService } from './OrganisationFormService';
import { OrganisationLabelProvider } from './OrganisationLabelProvider';
import { OrganisationSearchDefinition } from './OrganisationSearchDefinition';
import { OrganisationService } from './OrganisationService';
import { SearchService } from '../../../search/webapp/core/SearchService';

export class UIModule implements IUIModule {

    public priority: number = 302;

    public name: string = 'OrganisationReadUIModule';

    public async register(): Promise<void> {
        PlaceholderService.getInstance().registerPlaceholderHandler(new OrganisationPlaceholderHandler());

        ServiceRegistry.registerServiceInstance(OrganisationService.getInstance());
        ServiceRegistry.registerServiceInstance(OrganisationFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new OrganisationTableFactory());
        LabelService.getInstance().registerLabelProvider(new OrganisationLabelProvider());
        SearchService.getInstance().registerSearchDefinition(new OrganisationSearchDefinition());

        await this.registerContexts();
        this.registerActions();
    }

    public async registerExtensions(): Promise<void> {
        return;
    }

    private async registerContexts(): Promise<void> {
        const organisationDetailsContext = new ContextDescriptor(
            OrganisationDetailsContext.CONTEXT_ID, [KIXObjectType.ORGANISATION], ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['organisations'], OrganisationDetailsContext,
            [
                new UIComponentPermission('organisations', [CRUD.READ])
            ],
            'Translatable#Organisation Details', 'kix-icon-man-house'
        );
        ContextService.getInstance().registerContext(organisationDetailsContext);

        const organisationsSearchContext = new ContextDescriptor(
            OrganisationSearchContext.CONTEXT_ID, [KIXObjectType.ORGANISATION], ContextType.MAIN, ContextMode.SEARCH,
            false, 'search', ['organisations'], OrganisationSearchContext,
            [
                new UIComponentPermission('organisations', [CRUD.READ])
            ],
            'Translatable#Organisation', 'kix-icon-man-house', null, 300
        );
        ContextService.getInstance().registerContext(organisationsSearchContext);
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('organisation-search-action', OrganisationSearchAction);
        ActionFactory.getInstance().registerAction('organisation-csvexport-action', OrganisationCSVExportAction);
    }

}
