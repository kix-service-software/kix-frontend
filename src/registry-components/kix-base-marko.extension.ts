import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class KIXMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            ...this.getTicketDependencies(),
            ...this.getFaqDependencies(),
            'quick-search',
            '_base-components/dialog-creation/dialog-creation-container',
            'cmdb/cmdb-module',
            'customers/customers-module',
            'home/home-module',
            'reports/reports-module',
            'search/search-module',
            'icon-bar/dashboard-configuration/dashboard-configuration-dialog'
        ];
    }

    private getTicketDependencies(): string[] {
        return [
            'ticket/ticket-queue-explorer',
            'ticket/ticket-queue-explorer/ticket-queue-explorer-configuration',
            'ticket/ticket-service-explorer',
            'ticket/ticket-service-explorer/ticket-service-explorer-configuration',
            'ticket/ticket-module',
            'ticket/ticket-details',
            'ticket/ticket-search/ticket-search-result',
            'ticket/ticket-search/ticket-search-dialog-content',
            'ticket/ticket-list-widget',
            'ticket/ticket-list-widget/ticket-list-configuration',
            'ticket/ticket-info-widget',
            'ticket/ticket-history-widget',
            'ticket/ticket-info-widget/ticket-info-configuration',
            'ticket/ticket-creation-dialog',
            'ticket/ticket-description-widget'
        ];
    }

    private getFaqDependencies(): string[] {
        return [
            'faq/faq-module',
            'faq/faq-creation-dialog'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ...this.getTicketComponentTags(),
            ...this.getFaqComponentTags(),
            ['cmdb', 'cmdb/cmdb-module'],
            ['customers', 'customers/customers-module'],
            ['dialog-creation-container', '_base-components/dialog-creation/dialog-creation-container'],
            ['home', 'home/home-module'],
            ['reports', 'reports/reports-module'],
            ['search', 'search/search-module'],
            ['dashboard-configuration-dialog', 'icon-bar/dashboard-configuration/dashboard-configuration-dialog']
        ];
    }

    private getTicketComponentTags(): Array<[string, string]> {
        return [
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
            ['ticket-queue-explorer', 'ticket/ticket-queue-explorer'],
            [
                'ticket-queue-explorer-configuration',
                'ticket/ticket-queue-explorer/ticket-queue-explorer-configuration'
            ],
            ['ticket-service-explorer', 'ticket/ticket-service-explorer'],
            [
                'ticket-service-explorer-configuration',
                'ticket/ticket-service-explorer/ticket-service-explorer-configuration'
            ],
            ['ticket-history-widget', 'ticket/ticket-history-widget'],
            ['ticket-description-widget', 'ticket/ticket-description-widget']
        ];
    }

    private getFaqComponentTags(): Array<[string, string]> {
        return [
            ['faq', 'faq/faq-module'],
            ['faq-creation-dialog', 'faq/faq-creation-dialog']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new KIXMarkoDependencyExtension();
};
