import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class Extension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'faq/dialogs/new-faq-article-dialog',
            'faq/dialogs/inputs/faq-category-input',
            'faq/dialogs/inputs/faq-visibility-input'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['new-faq-article-dialog', 'faq/dialogs/new-faq-article-dialog'],
            ['faq-category-input', 'faq/dialogs/inputs/faq-category-input'],
            ['faq-visibility-input', 'faq/dialogs/inputs/faq-visibility-input']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
