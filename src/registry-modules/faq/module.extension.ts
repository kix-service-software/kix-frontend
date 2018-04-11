import { IModuleFactoryExtension } from '@kix/core/dist/extensions';

export class FAQModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "faq";
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
    return new FAQModuleFactoryExtension();
};
