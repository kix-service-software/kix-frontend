import { IModuleFactoryExtension } from '@kix/core/dist/extensions';

export class ReportsModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "reports";
    }

    public getDefaultConfiguration(): any {
        const content = {};
        return content;
    }

    public createFormularDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ReportsModuleFactoryExtension();
};
