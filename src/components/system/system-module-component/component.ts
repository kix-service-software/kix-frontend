import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ServiceRegistry, FactoryService, TableFactoryService, LabelService, InitComponent
} from '../../../core/browser';
import {
    SysConfigService, SysConfigOptionBrowserFactory, SysConfigOptionDefinitionBrowserFactory
} from '../../../core/browser/sysconfig';
import { KIXObjectType } from '../../../core/model';
import { SysConfigFormService } from '../../../core/browser/sysconfig/SysConfigFormService';
import { SysConfigTableFactory } from '../../../core/browser/sysconfig/table';
import { SysConfigLabelProvider } from '../../../core/browser/sysconfig/SysConfigLabelProvider';

class Component extends AbstractMarkoComponent implements InitComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async init(): Promise<void> {
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

module.exports = Component;
