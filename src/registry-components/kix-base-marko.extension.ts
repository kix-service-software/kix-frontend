import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class KIXMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'base-components/creation-dialog/creation-dialog-container',
            'ticket-module',
            'ticket-details',
            'ticket-search/ticket-search-result',
            'ticket-search/ticket-search-dialog-content',
            'ticket-list-widget',
            'ticket-list-widget/ticket-list-configuration',
            'ticket-info-widget',
            'ticket-info-widget/ticket-info-configuration',
            'ticket-creation-dialog'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['creation-dialog-container', 'base-components/creation-dialog/creation-dialog-container'],
            ['tickets', 'ticket-module'],
            ['ticket-details', 'ticket-details'],
            ['ticket-table', 'base-components/ticket-table'],
            ['ticket-search-result', 'ticket-search/ticket-search-result'],
            ['ticket-search-dialog-content', 'ticket-search/ticket-search-dialog-content'],
            ['ticket-list-widget', 'ticket-list-widget'],
            ['ticket-list-configuration', 'ticket-list-widget/ticket-list-configuration'],
            ['ticket-info-widget', 'ticket-info-widget'],
            ['ticket-info-configuration', 'ticket-info-widget/ticket-info-configuration'],
            ['ticket-creation-dialog', 'ticket-creation-dialog'],
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new KIXMarkoDependencyExtension();
};
