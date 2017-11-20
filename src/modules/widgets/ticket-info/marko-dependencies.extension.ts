import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class TicketInfoWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/ticket-info"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new TicketInfoWidgetMarkoDependencyExtension();
};
