import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ContextConfiguration } from '@kix/core/dist/model';
import { ReleaseContextConfiguration, ReleaseContext } from '@kix/core/dist/browser/release';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return ReleaseContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        const content: string[] = [];
        const contentWidgets = [];

        return new ReleaseContextConfiguration(
            this.getModuleId(),
            [],
            [],
            [],
            [],
            content,
            contentWidgets,
            [],
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
