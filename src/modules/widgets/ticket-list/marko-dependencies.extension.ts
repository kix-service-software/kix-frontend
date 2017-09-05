import { IMarkoDependencyExtension } from './../../../extensions/IMarkoDependencyExtension';

export class TicketListWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/ticket-list"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new TicketListWidgetMarkoDependencyExtension();
};
