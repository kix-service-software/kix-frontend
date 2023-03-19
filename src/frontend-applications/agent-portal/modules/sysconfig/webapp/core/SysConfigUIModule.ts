/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { SysConfigFormService, SysConfigTableFactory, SysConfigLabelProvider, EditSysConfigDialogContext } from '.';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { SysConfigService } from './SysConfigService';
import { SysConfigTableCSSHandler } from './table';
import { ActionFactory } from '../../../base-components/webapp/core/ActionFactory';
import { SysconfigTableResetAction } from './SysconfigTableResetAction';
import { ReloadConfigurationCacheAction } from './ReloadConfigurationCacheAction';
import { SysconfigEditAction } from './SysconfigEditAction';
import { PlaceholderService } from '../../../base-components/webapp/core/PlaceholderService';
import { SysConfigPlaceholderHandler } from './SysConfigPlaceholderHandler';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { TableCSSHandlerRegistry } from '../../../table/webapp/core/css-handler/TableCSSHandlerRegistry';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';

export class UIModule implements IUIModule {

    public name: string = 'SysconfigUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public priority: number = 800;

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(SysConfigService.getInstance());
        ServiceRegistry.registerServiceInstance(SysConfigFormService.getInstance());
        TableFactoryService.getInstance().registerFactory(new SysConfigTableFactory());
        LabelService.getInstance().registerLabelProvider(new SysConfigLabelProvider());

        TableCSSHandlerRegistry.getInstance().registerObjectCSSHandler(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, new SysConfigTableCSSHandler()
        );

        const editSysConfigDialogContext = new ContextDescriptor(
            EditSysConfigDialogContext.CONTEXT_ID, [KIXObjectType.SYS_CONFIG_OPTION],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-sysconfig-dialog', ['sysconfig'], EditSysConfigDialogContext,
            [
                new UIComponentPermission('system/config/FQDN', [CRUD.UPDATE])
            ],
            'Translatable#Edit Sysconfig', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(editSysConfigDialogContext);

        ActionFactory.getInstance().registerAction('sysconfig-edit-action', SysconfigEditAction);
        ActionFactory.getInstance().registerAction('sysconfig-reset-action', SysconfigTableResetAction);
        ActionFactory.getInstance().registerAction('activate-configuration', ReloadConfigurationCacheAction);

        PlaceholderService.getInstance().registerPlaceholderHandler(new SysConfigPlaceholderHandler());
    }

}
