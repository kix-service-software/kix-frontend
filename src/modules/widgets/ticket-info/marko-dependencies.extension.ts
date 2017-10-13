import { IMarkoDependencyExtension } from '@kix/core';

export class TicketInfoWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/ticket-info",
            "widgets/ticket-info/configuration"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new TicketInfoWidgetMarkoDependencyExtension();
};
