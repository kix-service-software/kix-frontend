import { IMainMenuExtension } from '@kix/core/dist/extensions';

export class TicketsMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/ticket-dashboard";
    }

    public getIcon(): string {
        return "";
    }

    public getText(): string {
        return "Tickets";
    }

    public getContextId(): string {
        return "ticket-dashboard";
    }

}

module.exports = (data, host, options) => {
    return new TicketsMainMenuExtension();
};
