import { IMainMenuExtension } from '@kix/core/dist/extensions';

export class TicketsMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/tickets";
    }

    public getIcon(): string {
        return "ticket";
    }

    public getText(): string {
        return "Tickets";
    }

    public getContextId(): string {
        return "tickets";
    }

}

module.exports = (data, host, options) => {
    return new TicketsMainMenuExtension();
};
