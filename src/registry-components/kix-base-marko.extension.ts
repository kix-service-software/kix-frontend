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
            'ticket/ticket-module',
            'ticket/ticket-details',
            'ticket/ticket-search/ticket-search-result',
            'ticket/ticket-search/ticket-search-dialog-content',
            'ticket/ticket-list-widget',
            'ticket/ticket-list-widget/ticket-list-configuration',
            'ticket/ticket-info-widget',
            'ticket/ticket-info-widget/ticket-info-configuration',
            'ticket/ticket-creation-dialog',
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
            ['tickets', 'ticket/ticket-module'],
            ['ticket-details', 'ticket/ticket-details'],
            ['ticket-table', 'ticket/ticket-table'],
            ['ticket-search-result', 'ticket/ticket-search/ticket-search-result'],
            ['ticket-search-dialog-content', 'ticket/ticket-search/ticket-search-dialog-content'],
            ['ticket-list-widget', 'ticket/ticket-list-widget'],
            ['ticket-list-configuration', 'ticket/ticket-list-widget/ticket-list-configuration'],
            ['ticket-info-widget', 'ticket/ticket-info-widget'],
            ['ticket-info-configuration', 'ticket/ticket-info-widget/ticket-info-configuration'],
            ['ticket-creation-dialog', 'ticket/ticket-creation-dialog'],
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
