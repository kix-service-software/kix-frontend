import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class TicketsMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "modules/tickets",
            "dialogs/ticket-creation"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new TicketsMarkoDependencyExtension();
};
