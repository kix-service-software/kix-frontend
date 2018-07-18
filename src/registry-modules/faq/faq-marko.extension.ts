import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class Extension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'faq/dialogs/new-faq-article-dialog'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['new-faq-article-dialog', 'faq/dialogs/new-faq-article-dialog']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
