import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { TicketSearchContextConfiguration, TicketSearchContext } from '@kix/core/dist/browser/ticket';
import { ContextConfiguration } from '@kix/core/dist/model';

export class ModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return TicketSearchContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new TicketSearchContextConfiguration(TicketSearchContext.CONTEXT_ID, [], [], [], [], []);
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
