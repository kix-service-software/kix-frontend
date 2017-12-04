import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ContainerConfiguration } from '@kix/core/dist/model/';

export class TicketModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/modules/tickets/';
    }

    public getModuleId(): string {
        return "ticket";
    }

    public getDefaultConfiguration(): any {
        const content = new ContainerConfiguration();
        return content;
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
