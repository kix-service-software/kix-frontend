import { IMarkoDependencyExtension } from '@kix/core';

export class TicketMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "dialogs/ticket-creation"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new TicketMarkoDependencyExtension();
};
