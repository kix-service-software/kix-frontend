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
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../base-components/webapp/core/table';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import {
    SystemAddressService, SystemAddressFormService, SystemAddressTableFactory,
    SystemAddressLabelProvider, SystemAddressCreateAction, NewSystemAddressDialogContext, SystemAddressEditAction,
    EditSystemAddressDialogContext, SystemAddressDetailsContext
} from '.';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';

export class UIModule implements IUIModule {

    public priority: number = 10000;

    public name: string = 'SystemAddressUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(SystemAddressService.getInstance());
        ServiceRegistry.registerServiceInstance(SystemAddressFormService.getInstance());
        TableFactoryService.getInstance().registerFactory(new SystemAddressTableFactory());
        LabelService.getInstance().registerLabelProvider(new SystemAddressLabelProvider());

        ActionFactory.getInstance().registerAction('system-address-create', SystemAddressCreateAction);

        const newSystemAddressDialogContext = new ContextDescriptor(
            NewSystemAddressDialogContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-system-address-dialog', ['system-addresses'], NewSystemAddressDialogContext,
            [
                new UIComponentPermission('system/communication/systemaddresses', [CRUD.CREATE])
            ]
        );
        ContextService.getInstance().registerContext(newSystemAddressDialogContext);

        ActionFactory.getInstance().registerAction('system-address-edit', SystemAddressEditAction);

        const editSystemAddressDialogContext = new ContextDescriptor(
            EditSystemAddressDialogContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-system-address-dialog', ['system-addresses'], EditSystemAddressDialogContext,
            [
                new UIComponentPermission('system/communication/systemaddresses', [CRUD.CREATE])
            ]
        );
        ContextService.getInstance().registerContext(editSystemAddressDialogContext);

        const systemAddressDetailsContext = new ContextDescriptor(
            SystemAddressDetailsContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['system-addresses'], SystemAddressDetailsContext,
            [
                new UIComponentPermission('system/communication/systemaddresses', [CRUD.READ])
            ]
        );
        ContextService.getInstance().registerContext(systemAddressDetailsContext);
    }
}
