/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../application/IUIModule";
import { ServiceRegistry, FactoryService } from "../../kix";
import { KIXObjectType } from "../../../model";
import { TableFactoryService } from "../../table";
import { LabelService } from "../../LabelService";
import {
    SysConfigService, SysConfigFormService, SysConfigOptionBrowserFactory,
    SysConfigOptionDefinitionBrowserFactory, SysConfigLabelProvider
} from "../../sysconfig";
import { SysConfigTableFactory } from "../../sysconfig/table";

export class UIModule implements IUIModule {

    public priority: number = 500;

    public unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

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

        this.registerAdminContexts();
        this.registerAdminActions();
        this.registerAdminDialogs();
    }

    // tslint:disable-next-line:no-empty
    private registerAdminContexts(): void {
    }

    // tslint:disable-next-line:no-empty
    private registerAdminActions(): void {
    }

    // tslint:disable-next-line:no-empty
    private registerAdminDialogs(): void {
    }
}
