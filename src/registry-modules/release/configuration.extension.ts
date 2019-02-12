import { IConfigurationExtension } from '../../core/extensions';
import { ContextConfiguration } from '../../core/model';
import { ReleaseContextConfiguration, ReleaseContext } from '../../core/browser/release';

export class DashboardModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ReleaseContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

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

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
