import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class TicketListWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'widgets/ticket-list',
            'widgets/ticket-list/ticket-list-configuration'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['ticket-list', 'widgets/ticket-list'],
            ['ticket-list-configuration', 'widgets/ticket-list/ticket-list-configuration']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new TicketListWidgetMarkoDependencyExtension();
};
