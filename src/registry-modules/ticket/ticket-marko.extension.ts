import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class KIXMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        const dialog = [
            'ticket/dialogs/new-ticket-dialog',
            'ticket/dialogs/link-ticket-dialog',
            'ticket/dialogs/inputs/article-input-body',
            'ticket/dialogs/inputs/article-input-attachment',
            'ticket/dialogs/inputs/ticket-input-owner',
            'ticket/dialogs/inputs/ticket-input-type',
            'ticket/dialogs/inputs/ticket-input-priority',
            'ticket/dialogs/inputs/ticket-input-state',
            'ticket/dialogs/inputs/ticket-input-sla',
            'ticket/dialogs/inputs/ticket-input-service',
            'ticket/dialogs/inputs/ticket-input-queue',
            'ticket/dialogs/inputs/ticket-input-contact',
            'ticket/dialogs/inputs/ticket-input-customer',
            'ticket/dialogs/inputs/ticket-input-link',
            'ticket/dialogs/inputs/ticket-input-archive-search'
        ];
        const widgets = [
            'ticket/widgets/article-receiver-list-widget',
            'ticket/widgets/ticket-list-widget',
            'ticket/widgets/ticket-info-widget',
            'ticket/widgets/ticket-history-widget',
            'ticket/widgets/ticket-description-widget',
            'ticket/widgets/ticket-customer-info-widget',
            'ticket/widgets/ticket-contact-info-widget',
            'ticket/widgets/ticket-dynamic-fields-widget',
            'ticket/widgets/ticket-linked-objects-widget'
        ];

        return [
            'ticket/ticket-module',
            'ticket/ticket-details',
            'ticket/ticket-dynamic-fields-container',
            'ticket/ticket-article-details',
            'ticket/ticket-article-attachment-list',
            'ticket/ticket-contact-info',
            'ticket/ticket-customer-info',
            ...dialog,
            ...widgets
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        const widgets: Array<[string, string]> = [
            ['article-receiver-list-widget', 'ticket/widgets/article-receiver-list-widget'],
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

        const inputs: Array<[string, string]> = [
            ['article-input-body', 'ticket/dialogs/inputs/article-input-body'],
            ['article-input-attachment', 'ticket/dialogs/inputs/article-input-attachment'],
            ['ticket-input-owner', 'ticket/dialogs/inputs/ticket-input-owner'],
            ['ticket-input-type', 'ticket/dialogs/inputs/ticket-input-type'],
            ['ticket-input-priority', 'ticket/dialogs/inputs/ticket-input-priority'],
            ['ticket-input-state', 'ticket/dialogs/inputs/ticket-input-state'],
            ['ticket-input-sla', 'ticket/dialogs/inputs/ticket-input-sla'],
            ['ticket-input-service', 'ticket/dialogs/inputs/ticket-input-service'],
            ['ticket-input-queue', 'ticket/dialogs/inputs/ticket-input-queue'],
            ['ticket-input-contact', 'ticket/dialogs/inputs/ticket-input-contact'],
            ['ticket-input-customer', 'ticket/dialogs/inputs/ticket-input-customer'],
            ['ticket-input-link', 'ticket/dialogs/inputs/ticket-input-link'],
            ['ticket-input-archive-search', 'ticket/dialogs/inputs/ticket-input-archive-search']
        ];

        return [
            ['tickets', 'ticket/ticket-module'],
            ['ticket-article-attachment-list', 'ticket/ticket-article-attachment-list'],
            ['ticket-details', 'ticket/ticket-details'],
            ['ticket-article-details', 'ticket/ticket-article-details'],
            ['new-ticket-dialog', 'ticket/dialogs/new-ticket-dialog'],
            ['link-ticket-dialog', 'ticket/dialogs/link-ticket-dialog'],
            ['ticket-contact-info', 'ticket/ticket-contact-info'],
            ['ticket-customer-info', 'ticket/ticket-customer-info'],
            ...inputs,
            ...widgets,
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new KIXMarkoDependencyExtension();
};
