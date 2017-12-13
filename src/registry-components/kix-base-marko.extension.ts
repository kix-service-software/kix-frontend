import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class KIXMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            '_base-components/dialog-creation/dialog-creation-container',
            'cmdb-module',
            'customers-module',
            'faq-module',
            'faq-creation-dialog',
            'home-module',
            'reports-module',
            'search-module',
            'ticket-module',
            'ticket-details',
            'ticket-search/ticket-search-result',
            'ticket-search/ticket-search-dialog-content',
            'ticket-list-widget',
            'ticket-list-widget/ticket-list-configuration',
            'ticket-info-widget',
            'ticket-info-widget/ticket-info-configuration',
            'ticket-creation-dialog',
            'icon-bar/dashboard-configuration/dashboard-configuration-dialog'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['cmdb', 'cmdb-module'],
            ['customers', 'customers-module'],
            ['faq', 'faq-module'],
            ['faq-creation-dialog', 'faq-creation-dialog'],
            ['dialog-creation-container', '_base-components/dialog-creation/dialog-creation-container'],
            ['home', 'home-module'],
            ['reports', 'reports-module'],
            ['search', 'search-module'],
            ['tickets', 'ticket-module'],
            ['ticket-details', 'ticket-details'],
            ['ticket-table', '_base-components/ticket-table'],
            ['ticket-search-result', 'ticket-search/ticket-search-result'],
            ['ticket-search-dialog-content', 'ticket-search/ticket-search-dialog-content'],
            ['ticket-list-widget', 'ticket-list-widget'],
            ['ticket-list-configuration', 'ticket-list-widget/ticket-list-configuration'],
            ['ticket-info-widget', 'ticket-info-widget'],
            ['ticket-info-configuration', 'ticket-info-widget/ticket-info-configuration'],
            ['ticket-creation-dialog', 'ticket-creation-dialog'],
            ['dashboard-configuration-dialog', 'icon-bar/dashboard-configuration/dashboard-configuration-dialog']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new KIXMarkoDependencyExtension();
};
