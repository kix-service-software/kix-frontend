/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { ConfigItemClassService, ConfigItemClassFormService, ConfigItemClassTableFactory, ConfigItemClassDefinitionTableFactory, ConfigItemClassLabelProvider, ConfigItemClassDefinitionLabelProvider, ConfigItemClassCreateAction, NewConfigItemClassDialogContext, ConfigItemClassEditAction, EditConfigItemClassDialogContext, ConfigItemClassDetailsContext } from '.';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';



export class UIModule implements IUIModule {

    public name: string = 'CMDBAdminUIModule';

    public priority: number = 204;

    public unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {

        ServiceRegistry.registerServiceInstance(ConfigItemClassService.getInstance());
        ServiceRegistry.registerServiceInstance(ConfigItemClassFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new ConfigItemClassTableFactory());
        TableFactoryService.getInstance().registerFactory(new ConfigItemClassDefinitionTableFactory());
        LabelService.getInstance().registerLabelProvider(new ConfigItemClassLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemClassDefinitionLabelProvider());

        ActionFactory.getInstance().registerAction('cmdb-admin-ci-class-create', ConfigItemClassCreateAction);

        const newConfigItemClassDetailsContext = new ContextDescriptor(
            NewConfigItemClassDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            true, 'object-dialog', ['configitemclasses'], NewConfigItemClassDialogContext,
            [
                new UIComponentPermission('system/cmdb/classes', [CRUD.READ])
            ],
            'Translatable#New Asset Class', 'kix-icon-ci', ConfigItemClassDetailsContext.CONTEXT_ID
        );
        ContextService.getInstance().registerContext(newConfigItemClassDetailsContext);

        ActionFactory.getInstance().registerAction('cmdb-admin-ci-class-edit', ConfigItemClassEditAction);

        const editConfigItemClassContext = new ContextDescriptor(
            EditConfigItemClassDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            true, 'object-dialog', ['configitemclasses'], EditConfigItemClassDialogContext,
            [
                new UIComponentPermission('system/cmdb/classes', [CRUD.CREATE])
            ],
            'Translatable#Edit Asset Class', 'kix-icon-ci', ConfigItemClassDetailsContext.CONTEXT_ID
        );
        ContextService.getInstance().registerContext(editConfigItemClassContext);

        const configItemClassDetailsContext = new ContextDescriptor(
            ConfigItemClassDetailsContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['configitemclasses'], ConfigItemClassDetailsContext,
            [
                new UIComponentPermission('system/cmdb/classes', [CRUD.CREATE])
            ],
            'Translatable#Asset Class Details', 'kix-icon-ci'
        );
        ContextService.getInstance().registerContext(configItemClassDetailsContext);
    }

}
