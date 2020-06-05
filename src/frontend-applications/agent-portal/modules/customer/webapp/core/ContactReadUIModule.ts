/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { PlaceholderService } from '../../../../modules/base-components/webapp/core/PlaceholderService';
import {
    ContactService, ContactFormService, ContactTableFactory,
    ContactLabelProvider, ContactBrowserFactory, ContactSearchDefinition, ContactDetailsContext,
    ContactSearchContext, ContactSearchAction, ContactCSVExportAction, ContactTableDependingAction
} from '.';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { TableFactoryService } from '../../../base-components/webapp/core/table';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { FactoryService } from '../../../../modules/base-components/webapp/core/FactoryService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SearchService } from '../../../search/webapp/core';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ContactPlaceholderHandler } from './ContactPlaceholderHandler';

export class UIModule implements IUIModule {

    public priority: number = 303;

    public name: string = 'CMDBReadUIModule';

    public unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
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
