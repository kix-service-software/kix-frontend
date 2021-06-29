/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { NewConfigItemDialogContext, EditConfigItemDialogContext, ConfigItemCreateAction, ConfigItemEditAction } from '.';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ConfigItemDuplicateAction } from './actions';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { ConfigItemDetailsContext } from './context';

export class UIModule implements IUIModule {

    public name: string = 'CMDBEditUIModule';

    public priority: number = 201;

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        await this.registerContexts();
        this.registerActions();
    }

    private async registerContexts(): Promise<void> {
        const newConfigItemDialogContext = new ContextDescriptor(
            NewConfigItemDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.DIALOG, ContextMode.CREATE,
            false, 'object-dialog', ['configitems'], NewConfigItemDialogContext,
            [
                new UIComponentPermission('cmdb/configitems', [CRUD.CREATE])
            ],
            'Translatable#Asset', 'kix-icon-ci', ConfigItemDetailsContext.CONTEXT_ID, 200
        );
        ContextService.getInstance().registerContext(newConfigItemDialogContext);

        const editConfigItemContext = new ContextDescriptor(
            EditConfigItemDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.DIALOG, ContextMode.EDIT,
            false, 'object-dialog', ['configitems'], EditConfigItemDialogContext,
            [
                new UIComponentPermission('cmdb/configitems', [CRUD.CREATE])
            ],
            'Translatable#Asset', 'kix-icon-ci', ConfigItemDetailsContext.CONTEXT_ID
        );
        ContextService.getInstance().registerContext(editConfigItemContext);
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('config-item-create-action', ConfigItemCreateAction);
        ActionFactory.getInstance().registerAction('config-item-edit-action', ConfigItemEditAction);
        ActionFactory.getInstance().registerAction('config-item-duplicate-action', ConfigItemDuplicateAction);
    }
}
