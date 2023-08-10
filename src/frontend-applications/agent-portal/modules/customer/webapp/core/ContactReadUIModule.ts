/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SearchService } from '../../../search/webapp/core';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ContactPlaceholderHandler } from './ContactPlaceholderHandler';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { ContactService } from './ContactService';
import { ContactSearchAction, ContactCSVExportAction, ContactTableDependingAction } from './actions';
import { ContactFormService } from './ContactFormService';
import { ContactLabelProvider } from './ContactLabelProvider';
import { ContactSearchDefinition } from './ContactSearchDefinition';
import { ContactDetailsContext } from './context/ContactDetailsContext';
import { ContactSearchContext } from './context/ContactSearchContext';
import { ContactTableFactory } from './table';
import { FormService } from '../../../base-components/webapp/core/FormService';
import { ContactFormFieldValueHandler } from './ContactFormFieldValueHandler';
import { ContactJobFormManager } from './ContactJobFormManager';
import { JobFormService } from '../../../job/webapp/core';
import { JobTypes } from '../../../job/model/JobTypes';

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
        SearchService.getInstance().registerSearchDefinition(new ContactSearchDefinition());

        FormService.getInstance().addFormFieldValueHandler(new ContactFormFieldValueHandler());

        JobFormService.getInstance().registerJobFormManager(JobTypes.CONTACT, new ContactJobFormManager());

        await this.registerContexts();
        this.registerActions();
    }

    private async registerContexts(): Promise<void> {
        const organisationDetailsContext = new ContextDescriptor(
            ContactDetailsContext.CONTEXT_ID, [KIXObjectType.CONTACT], ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['contacts'], ContactDetailsContext,
            [
                new UIComponentPermission('contacts', [CRUD.READ])
            ],
            'Translatable#Contact Details', 'kix-icon-man'
        );
        ContextService.getInstance().registerContext(organisationDetailsContext);

        const searchContactContext = new ContextDescriptor(
            ContactSearchContext.CONTEXT_ID, [KIXObjectType.CONTACT], ContextType.MAIN, ContextMode.SEARCH,
            false, 'search', ['contacts'], ContactSearchContext,
            [
                new UIComponentPermission('contacts', [CRUD.READ])
            ],
            'Translatable#Contact', 'kix-icon-man', null, 301
        );
        ContextService.getInstance().registerContext(searchContactContext);
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('contact-search-action', ContactSearchAction);
        ActionFactory.getInstance().registerAction('contact-csv-export-action', ContactCSVExportAction);
        ActionFactory.getInstance().registerAction('contact-table-depending-action', ContactTableDependingAction);
    }

}
