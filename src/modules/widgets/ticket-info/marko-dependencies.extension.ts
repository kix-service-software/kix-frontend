import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class TicketInfoWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/ticket-info",
            "widgets/ticket-info/ticket-info-configuration"
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['ticket-info-widget', 'widgets/ticket-info'],
            ['ticket-info-configuration', 'widgets/ticket-info/ticket-info-configuration'],
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new TicketInfoWidgetMarkoDependencyExtension();
};
