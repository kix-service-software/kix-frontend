import { AbstractMarkoComponent, ContextService } from '../../../core/browser';
import { ComponentState } from './ComponentState';
import { AdminContext, AdministrationSocketClient } from '../../../core/browser/admin';
import { ContextDescriptor, KIXObjectType, ContextMode, ContextType } from '../../../core/model';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const adminModules = await AdministrationSocketClient.getInstance().loadAdminCategories();

        if (adminModules && adminModules.length) {
            const contextDescriptor = new ContextDescriptor(
                AdminContext.CONTEXT_ID, [KIXObjectType.ANY],
                ContextType.MAIN, ContextMode.DASHBOARD,
                false, 'admin', ['admin'], AdminContext
            );
            ContextService.getInstance().registerContext(contextDescriptor);
        }
    }

}

module.exports = Component;
