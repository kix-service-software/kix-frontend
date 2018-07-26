import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ContextConfiguration } from '@kix/core/dist/model';
import { FAQContext, FAQContextConfiguration } from '@kix/core/dist/browser/faq';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return FAQContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new FAQContextConfiguration(this.getModuleId(), [], [], [], [], [], []);
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
