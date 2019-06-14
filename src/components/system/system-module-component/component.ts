import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ServiceRegistry, FactoryService, TableFactoryService, LabelService
} from '../../../core/browser';
import { SysConfigService } from '../../../core/browser/sysconfig';
import { KIXObjectType } from '../../../core/model';
import { SysConfigFormService } from '../../../core/browser/sysconfig/SysConfigFormService';
import { SysConfigBrowserFactory } from '../../../core/browser/sysconfig/SysConfigBrowserFactory';
import { SysConfigTableFactory } from '../../../core/browser/sysconfig/table';
import { SysConfigLabelProvider } from '../../../core/browser/sysconfig/SysConfigLabelProvider';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(SysConfigService.getInstance());
        ServiceRegistry.registerServiceInstance(SysConfigFormService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.SYS_CONFIG_ITEM, SysConfigBrowserFactory.getInstance()
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
