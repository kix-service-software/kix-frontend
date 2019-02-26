import { IKIXModuleExtension } from "../../core/extensions";

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
        ['ticket-input-archive-search', 'ticket/dialogs/inputs/ticket-input-archive-search'],
        ['channel-input', 'ticket/dialogs/inputs/channel-input'],
        ['article-email-from-input', 'ticket/dialogs/inputs/article-email-from-input'],
        ['article-email-recipient-input', 'ticket/dialogs/inputs/article-email-recipient-input'],
        ['ticket-admin-types', 'ticket/admin/ticket-admin-types'],
        ['ticket-type-details', 'ticket/admin/ticket-type-details'],
        ['ticket-type-info-widget', 'ticket/admin/widgets/ticket-type-info-widget'],
        ['ticket-type-assigned-textmodules', 'ticket/admin/widgets/ticket-type-assigned-textmodules'],
        ['new-ticket-type-dialog', 'ticket/admin/dialogs/new-ticket-type-dialog'],
        ['edit-ticket-type-dialog', 'ticket/admin/dialogs/edit-ticket-type-dialog'],
        ['ticket-admin-states', 'ticket/admin/ticket-admin-states'],
        ['ticket-state-details', 'ticket/admin/ticket-state-details'],
        ['ticket-state-info-widget', 'ticket/admin/widgets/ticket-state-info-widget'],
        ['ticket-state-assigned-textmodules', 'ticket/admin/widgets/ticket-state-assigned-textmodules'],
        ['new-ticket-state-dialog', 'ticket/admin/dialogs/new-ticket-state-dialog'],
        ['ticket-admin-priorities', 'ticket/admin/ticket-admin-priorities'],
        ['ticket-priority-details', 'ticket/admin/ticket-priority-details'],
        ['ticket-priority-info-widget', 'ticket/admin/widgets/ticket-priority-info-widget'],
        ['new-ticket-priority-dialog', 'ticket/admin/dialogs/new-ticket-priority-dialog'],
        ['edit-ticket-priority-dialog', 'ticket/admin/dialogs/edit-ticket-priority-dialog'],
        ['edit-ticket-state-dialog', 'ticket/admin/dialogs/edit-ticket-state-dialog'],
        ['go-to-article-cell', 'ticket/table/go-to-article-cell'],
        ['article-attachment-cell', 'ticket/table/article-attachment-cell'],
        ['article-attachment-count', 'ticket/article-attachment-count']
    ];

}

module.exports = (data, host, options) => {
    return new KIXModuleExtionsion();
};
