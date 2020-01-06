/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../../../model/IUIModule";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TableFactoryService, TableCSSHandlerRegistry } from "../../../base-components/webapp/core/table";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { ServiceRegistry } from "../../../../modules/base-components/webapp/core/ServiceRegistry";
import { FactoryService } from "../../../../modules/base-components/webapp/core/FactoryService";
import {
    SysConfigFormService, SysConfigOptionBrowserFactory, SysConfigOptionDefinitionBrowserFactory,
    SysConfigTableFactory, SysConfigLabelProvider, EditSysConfigDialogContext
} from ".";
import { ContextDescriptor } from "../../../../model/ContextDescriptor";
import { ContextType } from "../../../../model/ContextType";
import { ContextMode } from "../../../../model/ContextMode";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { SysConfigService } from "./SysConfigService";
import { SysConfigTableCSSHandler } from "./table";

export class UIModule implements IUIModule {

    public name: string = 'SysconfigUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public priority: number = 800;

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(SysConfigService.getInstance());
        ServiceRegistry.registerServiceInstance(SysConfigFormService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.SYS_CONFIG_OPTION, SysConfigOptionBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, SysConfigOptionDefinitionBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new SysConfigTableFactory());
        LabelService.getInstance().registerLabelProvider(new SysConfigLabelProvider());

        TableCSSHandlerRegistry.getInstance().registerObjectCSSHandler(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, new SysConfigTableCSSHandler()
        );

        const editSysConfigDialogContext = new ContextDescriptor(
            EditSysConfigDialogContext.CONTEXT_ID, [KIXObjectType.SYS_CONFIG_OPTION_DEFINITION],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-sysconfig-dialog', ['sysconfig'], EditSysConfigDialogContext
        );
        await ContextService.getInstance().registerContext(editSysConfigDialogContext);
    }

}
