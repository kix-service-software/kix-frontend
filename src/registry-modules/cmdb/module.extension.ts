import { IModuleFactoryExtension } from '@kix/core/dist/extensions';

export class CMDBModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "cmdb";
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
    return new CMDBModuleFactoryExtension();
};
