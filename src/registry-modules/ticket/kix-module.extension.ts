import { IKIXModuleExtension } from "@kix/core/dist/extensions";

class KIXModuleExtionsion implements IKIXModuleExtension {

    public initComponentId: string = 'ticket-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['ticket-module-component', 'ticket/ticket-module-component'],
        ['tickets', 'ticket/ticket-module'],
        ['ticket-list-module', 'ticket/ticket-list-module'],
        ['ticket-article-attachment-list', 'ticket/ticket-article-attachment-list'],
        ['ticket-details', 'ticket/ticket-details'],
        ['ticket-article-details', 'ticket/ticket-article-details'],
        ['new-ticket-dialog', 'ticket/dialogs/new-ticket-dialog'],
        ['search-ticket-dialog', 'ticket/dialogs/search-ticket-dialog'],
        ['edit-ticket-dialog', 'ticket/dialogs/edit-ticket-dialog'],
        ['new-ticket-article-dialog', 'ticket/dialogs/new-ticket-article-dialog'],
        ['ticket-contact-info', 'ticket/ticket-contact-info'],
        ['ticket-customer-info', 'ticket/ticket-customer-info'],
        ['article-receiver-list', 'ticket/article-receiver-list'],
        ['article-list-widget', 'ticket/widgets/article-list-widget'],
        ['ticket-list-widget', 'ticket/widgets/ticket-list-widget'],
        ['ticket-info-widget', 'ticket/widgets/ticket-info-widget'],
        ['ticket-history-widget', 'ticket/widgets/ticket-history-widget'],
        ['ticket-description-widget', 'ticket/widgets/ticket-description-widget'],
        ['ticket-customer-info-widget', 'ticket/widgets/ticket-customer-info-widget'],
        ['ticket-contact-info-widget', 'ticket/widgets/ticket-contact-info-widget'],
        ['ticket-dynamic-fields-widget', 'ticket/widgets/ticket-dynamic-fields-widget'],
        ['ticket-dynamic-fields-container', 'ticket/ticket-dynamic-fields-container'],
        ['ticket-chart-widget', 'ticket/widgets/ticket-chart-widget'],
        ['ticket-queue-explorer', 'ticket/widgets/ticket-queue-explorer'],
        ['ticket-input-owner', 'ticket/dialogs/inputs/ticket-input-owner'],
        ['ticket-input-type', 'ticket/dialogs/inputs/ticket-input-type'],
        ['ticket-input-priority', 'ticket/dialogs/inputs/ticket-input-priority'],
        ['ticket-input-state', 'ticket/dialogs/inputs/ticket-input-state'],
        ['ticket-input-sla', 'ticket/dialogs/inputs/ticket-input-sla'],
        ['ticket-input-service', 'ticket/dialogs/inputs/ticket-input-service'],
        ['ticket-input-queue', 'ticket/dialogs/inputs/ticket-input-queue'],
        ['ticket-input-contact', 'ticket/dialogs/inputs/ticket-input-contact'],
        ['ticket-input-customer', 'ticket/dialogs/inputs/ticket-input-customer'],
        ['ticket-input-archive-search', 'ticket/dialogs/inputs/ticket-input-archive-search']
    ];

}

module.exports = (data, host, options) => {
    return new KIXModuleExtionsion();
};
