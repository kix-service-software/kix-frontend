import { IMainMenuExtension } from '@kix/core/dist/extensions';

export class FAQMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/faq";
    }

    public getIcon(): string {
        return "";
    }

    public getText(): string {
        return "FAQ";
    }

    public getContextId(): string {
        return "faq";
    }

}

module.exports = (data, host, options) => {
    return new FAQMainMenuExtension();
};
