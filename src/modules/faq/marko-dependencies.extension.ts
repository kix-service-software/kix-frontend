import { IMarkoDependencyExtension } from '@kix/core';

export class FAQMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "modules/faq"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new FAQMarkoDependencyExtension();
};
