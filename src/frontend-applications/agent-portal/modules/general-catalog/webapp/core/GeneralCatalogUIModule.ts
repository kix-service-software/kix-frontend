/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import {
    GeneralCatalogService, GeneralCatalogFormService, GeneralCatalogTableFactory,
    GeneralCatalogLabelProvider, GeneralCatalogCreateAction, NewGeneralCatalogDialogContext,
    EditGeneralCatalogDialogContext
} from '.';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { FormService } from '../../../base-components/webapp/core/FormService';
import { GeneralCatalogItemFormFieldValueHandler } from './GeneralCatalogItemFormFieldValueHandler';

export class UIModule implements IUIModule {

    public priority: number = 10000;

    public name: string = 'GeneralCatalogUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(GeneralCatalogService.getInstance());
        ServiceRegistry.registerServiceInstance(GeneralCatalogFormService.getInstance());
        TableFactoryService.getInstance().registerFactory(new GeneralCatalogTableFactory());
        LabelService.getInstance().registerLabelProvider(new GeneralCatalogLabelProvider());

        ActionFactory.getInstance().registerAction('admin-general-catalog-create', GeneralCatalogCreateAction);

        FormService.getInstance().addFormFieldValueHandler(new GeneralCatalogItemFormFieldValueHandler());

        const newGeneralCatalogDialogContext = new ContextDescriptor(
            NewGeneralCatalogDialogContext.CONTEXT_ID, [KIXObjectType.GENERAL_CATALOG_ITEM],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            true, 'object-dialog', ['generalcatalog'], NewGeneralCatalogDialogContext,
            [
                new UIComponentPermission('system/generalcatalog', [CRUD.CREATE])
            ],
            'Translatable#New General Catalog', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(newGeneralCatalogDialogContext);
        const editGeneralCatalogDialogContext = new ContextDescriptor(
            EditGeneralCatalogDialogContext.CONTEXT_ID, [KIXObjectType.GENERAL_CATALOG_ITEM],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            true, 'object-dialog', ['generalcatalog'], EditGeneralCatalogDialogContext,
            [
                new UIComponentPermission('system/generalcatalog', [CRUD.CREATE])
            ],
            'Translatable#Edit General Catalog', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(editGeneralCatalogDialogContext);

    }
}
