import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class Extension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'faq/faq-module',
            'faq/faq-details',
            'faq/faq-vote-selector',
            'faq/dialogs/new-faq-article-dialog',
            'faq/dialogs/search-faq-article-dialog',
            'faq/dialogs/inputs/faq-category-input',
            'faq/dialogs/inputs/faq-visibility-input',
            'faq/widgets/faq-article-info-widget',
            'faq/widgets/faq-article-content-widget',
            'faq/widgets/faq-article-history-widget',
            'faq/widgets/faq-article-list-widget',
            'faq/widgets/faq-category-explorer'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['faq', 'faq/faq-module'],
            ['faq-details', 'faq/faq-details'],
            ['faq-vote-selector', 'faq/faq-vote-selector'],
            ['new-faq-article-dialog', 'faq/dialogs/new-faq-article-dialog'],
            ['search-faq-article-dialog', 'faq/dialogs/search-faq-article-dialog'],
            ['faq-category-input', 'faq/dialogs/inputs/faq-category-input'],
            ['faq-visibility-input', 'faq/dialogs/inputs/faq-visibility-input'],
            ['faq-article-info-widget', 'faq/widgets/faq-article-info-widget'],
            ['faq-article-content-widget', 'faq/widgets/faq-article-content-widget'],
            ['faq-article-history-widget', 'faq/widgets/faq-article-history-widget'],
            ['faq-article-list-widget', 'faq/widgets/faq-article-list-widget'],
            ['faq-category-explorer', 'faq/widgets/faq-category-explorer']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
