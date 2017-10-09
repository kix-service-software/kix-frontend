import { IMainMenuExtension } from '@kix/core';

export class FAQMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/faq-dashboard";
    }

    public getIcon(): string {
        return "";
    }

    public getText(): string {
        return "FAQ";
    }

    public getContextId(): string {
        return "faq-dashboard";
    }

}

module.exports = (data, host, options) => {
    return new FAQMainMenuExtension();
};
