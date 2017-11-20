import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class FAQMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "modules/faq",
            "dialogs/faq-creation",
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new FAQMarkoDependencyExtension();
};
