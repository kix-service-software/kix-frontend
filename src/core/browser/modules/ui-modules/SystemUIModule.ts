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
