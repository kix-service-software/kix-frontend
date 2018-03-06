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
            'ticket/explorer/ticket-queue-explorer',
            'ticket/explorer/ticket-queue-explorer/ticket-queue-explorer-configuration',
            'ticket/explorer/ticket-service-explorer',
            'ticket/explorer/ticket-service-explorer/ticket-service-explorer-configuration',
            'ticket/ticket-module',
            'ticket/ticket-details',
            'ticket/ticket-dynamic-fields-container',
            'ticket/ticket-search/ticket-search-result',
            'ticket/ticket-search/ticket-search-dialog-content',
            'ticket/widgets/ticket-list-widget',
            'ticket/widgets/ticket-list-widget/ticket-list-configuration',
            'ticket/widgets/ticket-info-widget',
            'ticket/widgets/ticket-history-widget',
            'ticket/widgets/ticket-info-widget/ticket-info-configuration',
            'ticket/widgets/ticket-description-widget',
            'ticket/widgets/ticket-customer-info-widget',
            'ticket/widgets/ticket-contact-info-widget',
            'ticket/widgets/ticket-dynamic-fields-widget',
            'ticket/widgets/ticket-linked-objects-widget',
            'ticket/actions/collective-article-action',
            'ticket/actions/edit-ticket-action',
            'ticket/actions/link-ticket-action',
            'ticket/actions/lock-ticket-action',
            'ticket/actions/merge-ticket-action',
            'ticket/actions/new-ticket-action',
            'ticket/actions/print-ticket-action',
            'ticket/actions/spam-ticket-action',
            'ticket/actions/watch-ticket-action',
            'ticket/actions/attachment-download-article-action',
            'ticket/actions/call-incoming-article-action',
            'ticket/actions/call-outgoing-article-action',
            'ticket/actions/delete-article-action',
            'ticket/actions/edit-article-action',
            'ticket/actions/new-email-article-action',
            'ticket/actions/new-note-article-action',
            'ticket/actions/print-article-action',
            'ticket/dialogs/ticket-creation-dialog',
            'ticket/dialogs/merge-ticket-dialog',
            'ticket/dialogs/edit-ticket-dialog',
            'ticket/dialogs/link-ticket-dialog',
            'ticket/dialogs/lock-ticket-dialog',
            'ticket/dialogs/spam-ticket-dialog',
            'ticket/dialogs/watch-ticket-dialog',
            'ticket/article-details',
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
            ['dashboard-configuration-dialog', 'icon-bar/dashboard-configuration/dashboard-configuration-dialog'],
            ['icon', '_base-components/icon']
        ];
    }

    // tslint:disable:max-line-length
    private getTicketComponentTags(): Array<[string, string]> {
        const widgets: Array<[string, string]> = [
            ['ticket-list-widget', 'ticket/widgets/ticket-list-widget'],
            ['ticket-list-configuration', 'ticket/widgets/ticket-list-widget/ticket-list-configuration'],
            ['ticket-info-widget', 'ticket/widgets/ticket-info-widget'],
            ['ticket-info-configuration', 'ticket/widgets/ticket-info-widget/ticket-info-configuration'],
            ['ticket-history-widget', 'ticket/widgets/ticket-history-widget'],
            ['ticket-description-widget', 'ticket/widgets/ticket-description-widget'],
            ['ticket-customer-info-widget', 'ticket/widgets/ticket-customer-info-widget'],
            ['ticket-contact-info-widget', 'ticket/widgets/ticket-contact-info-widget'],
            ['ticket-dynamic-fields-widget', 'ticket/widgets/ticket-dynamic-fields-widget'],
            ['ticket-linked-objects-widget', 'ticket/widgets/ticket-linked-objects-widget'],
            ['ticket-dynamic-fields-container', 'ticket/ticket-dynamic-fields-container']
        ];

        const explorer: Array<[string, string]> = [
            ['ticket-queue-explorer', 'ticket/explorer/ticket-queue-explorer'],
            ['ticket-queue-explorer-configuration', 'ticket/explorer/ticket-queue-explorer/ticket-queue-explorer-configuration'],
            ['ticket-service-explorer', 'ticket/explorer/ticket-service-explorer'],
            ['ticket-service-explorer-configuration', 'ticket/explorer/ticket-service-explorer/ticket-service-explorer-configuration'],
        ];

        const dialogs: Array<[string, string]> = [
            ['ticket-creation-dialog', 'ticket/dialogs/ticket-creation-dialog'],
            ['edit-ticket-dialog', 'ticket/dialogs/edit-ticket-dialog'],
            ['link-ticket-dialog', 'ticket/dialogs/link-ticket-dialog'],
            ['merge-ticket-dialog', 'ticket/dialogs/merge-ticket-dialog'],
            ['lock-ticket-dialog', 'ticket/dialogs/lock-ticket-dialog'],
            ['spam-ticket-dialog', 'ticket/dialogs/spam-ticket-dialog'],
            ['watch-ticket-dialog', 'ticket/dialogs/watch-ticket-dialog']
        ];

        const actions: Array<[string, string]> = [
            ['collective-article-action', 'ticket/actions/collective-article-action'],
            ['edit-ticket-action', 'ticket/actions/edit-ticket-action'],
            ['link-ticket-action', 'ticket/actions/link-ticket-action'],
            ['lock-ticket-action', 'ticket/actions/lock-ticket-action'],
            ['merge-ticket-action', 'ticket/actions/merge-ticket-action'],
            ['new-ticket-action', 'ticket/actions/new-ticket-action'],
            ['print-ticket-action', 'ticket/actions/print-ticket-action'],
            ['spam-ticket-action', 'ticket/actions/spam-ticket-action'],
            ['watch-ticket-action', 'ticket/actions/watch-ticket-action'],
            ['attachment-download-article-action', 'ticket/actions/attachment-download-article-action'],
            ['call-incoming-article-action', 'ticket/actions/call-incoming-article-action'],
            ['call-outgoing-article-action', 'ticket/actions/call-outgoing-article-action'],
            ['delete-article-action', 'ticket/actions/delete-article-action'],
            ['edit-article-action', 'ticket/actions/edit-article-action'],
            ['new-email-article-action', 'ticket/actions/new-email-article-action'],
            ['new-note-article-action', 'ticket/actions/new-note-article-action'],
            ['print-article-action', 'ticket/actions/print-article-action']
        ];

        return [
            ['tickets', 'ticket/ticket-module'],
            ['ticket-details', 'ticket/ticket-details'],
            ['ticket-table', 'ticket/ticket-table'],
            ['ticket-search-result', 'ticket/ticket-search/ticket-search-result'],
            ['ticket-search-dialog-content', 'ticket/ticket-search/ticket-search-dialog-content'],
            ['ticket-property-label', 'ticket/ticket-labels/ticket-property-label'],
            ['article-details', 'ticket/article-details'],
            ...widgets,
            ...explorer,
            ...dialogs,
            ...actions
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
