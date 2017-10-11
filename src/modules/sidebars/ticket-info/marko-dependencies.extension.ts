import { IMarkoDependencyExtension } from '@kix/core';

export class TicketInfoSidebarMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "sidebars/ticket-info",
            "sidebars/ticket-info/configuration"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new TicketInfoSidebarMarkoDependencyExtension();
};
