import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class Extension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'faq/faq-details',
            'faq/dialogs/new-faq-article-dialog',
            'faq/dialogs/inputs/faq-category-input',
            'faq/dialogs/inputs/faq-visibility-input',
            'faq/widgets/faq-article-info-widget'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['faq-details', 'faq/faq-details'],
            ['new-faq-article-dialog', 'faq/dialogs/new-faq-article-dialog'],
            ['faq-category-input', 'faq/dialogs/inputs/faq-category-input'],
            ['faq-visibility-input', 'faq/dialogs/inputs/faq-visibility-input'],
            ['faq-article-info-widget', 'faq/widgets/faq-article-info-widget']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
