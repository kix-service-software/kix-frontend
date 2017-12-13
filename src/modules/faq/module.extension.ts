import { IModuleFactoryExtension } from '@kix/core/dist/extensions';

export class FAQModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/componets/faq/';
    }

    public getModuleId(): string {
        return "faq";
    }

    public getDefaultConfiguration(): any {
        const content = {};
        return content;
    }

}

module.exports = (data, host, options) => {
    return new FAQModuleFactoryExtension();
};
