import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, ServiceRegistry, LabelService, FactoryService } from '../../../core/browser';
import { RoleService, RoleTableFactory, RoleBrowserFactory, RoleLabelProvider } from '../../../core/browser/user';
import { KIXObjectType } from '../../../core/model';
import { TableFactoryService } from '../../../core/browser/table';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(RoleService.getInstance());

        LabelService.getInstance().registerLabelProvider(new RoleLabelProvider());

        TableFactoryService.getInstance().registerFactory(new RoleTableFactory());

        FactoryService.getInstance().registerFactory(KIXObjectType.ROLE, RoleBrowserFactory.getInstance());
    }
}

module.exports = Component;
