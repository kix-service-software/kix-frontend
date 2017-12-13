import { IModuleFactoryExtension } from '@kix/core/dist/extensions';

export class ReportsModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/componets/reports/';
    }

    public getModuleId(): string {
        return "reports";
    }

    public getDefaultConfiguration(): any {
        const content = {};
        return content;
    }

}

module.exports = (data, host, options) => {
    return new ReportsModuleFactoryExtension();
};
