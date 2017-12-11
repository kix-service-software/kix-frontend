import { IModuleFactoryExtension } from '@kix/core/dist/extensions';

export class TicketModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/modules/tickets/';
    }

    public getModuleId(): string {
        return "tickets";
    }

    public getDefaultConfiguration(): any {
        const content = {};
        return content;
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
