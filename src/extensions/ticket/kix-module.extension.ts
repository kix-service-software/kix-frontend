import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";
import { CRUD } from "../../core/model";

class Extension implements IKIXModuleExtension {

    public tags: Array<[string, string]>;

    public id = 'ticket-module';

    public initComponents: UIComponent[] = [
        new UIComponent('ticket-read-module-component', 'ticket/module/ticket-read-module-component',
            [
                new UIComponentPermission('tickets', [CRUD.READ])
            ]
        ),
        new UIComponent('ticket-create-module-component', 'ticket/module/ticket-create-module-component',
            [
                new UIComponentPermission('tickets', [CRUD.CREATE])
            ]
        ),
        new UIComponent('ticket-update-module-component', 'ticket/module/ticket-update-module-component',
            [
                new UIComponentPermission('tickets/*', [CRUD.UPDATE]),
            ]
        ),
        new UIComponent(
            'ticket-article-create-module-component',
            'ticket/module/ticket-article-create-module-component',
            [
                new UIComponentPermission('tickets/*/articles', [CRUD.CREATE])
            ]
        )
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('tickets', 'ticket/ticket-module', []),
        new UIComponent('ticket-list-module', 'ticket/ticket-list-module', []),
        new UIComponent('ticket-article-attachment-list', 'ticket/ticket-article-attachment-list', []),
        new UIComponent('ticket-article-details', 'ticket/ticket-article-details', []),
        new UIComponent('new-ticket-dialog', 'ticket/dialogs/new-ticket-dialog', []),
        new UIComponent('search-ticket-dialog', 'ticket/dialogs/search-ticket-dialog', []),
        new UIComponent('edit-ticket-dialog', 'ticket/dialogs/edit-ticket-dialog', []),
        new UIComponent('new-ticket-article-dialog', 'ticket/dialogs/new-ticket-article-dialog', []),
        new UIComponent('article-receiver-list', 'ticket/article-receiver-list', []),
        new UIComponent('ticket-info-widget', 'ticket/widgets/ticket-info-widget', []),
        new UIComponent('ticket-history-widget', 'ticket/widgets/ticket-history-widget', []),
        new UIComponent('ticket-description-widget', 'ticket/widgets/ticket-description-widget', []),
        new UIComponent('ticket-dynamic-fields-widget', 'ticket/widgets/ticket-dynamic-fields-widget', []),
        new UIComponent('ticket-dynamic-fields-container', 'ticket/ticket-dynamic-fields-container', []),
        new UIComponent('ticket-chart-widget', 'ticket/widgets/ticket-chart-widget', []),
        new UIComponent('ticket-queue-explorer', 'ticket/widgets/ticket-queue-explorer', []),
        new UIComponent('ticket-input-type', 'ticket/dialogs/inputs/ticket-input-type', []),
        new UIComponent('ticket-input-priority', 'ticket/dialogs/inputs/ticket-input-priority', []),
        new UIComponent('ticket-input-state', 'ticket/dialogs/inputs/ticket-input-state', []),
        new UIComponent('ticket-input-sla', 'ticket/dialogs/inputs/ticket-input-sla', []),
        new UIComponent('ticket-input-service', 'ticket/dialogs/inputs/ticket-input-service', []),
        new UIComponent('ticket-input-queue', 'ticket/dialogs/inputs/ticket-input-queue', []),
        new UIComponent('ticket-input-contact', 'ticket/dialogs/inputs/ticket-input-contact', []),
        new UIComponent('ticket-input-organisation', 'ticket/dialogs/inputs/ticket-input-organisation', []),
        new UIComponent('ticket-input-archive-search', 'ticket/dialogs/inputs/ticket-input-archive-search', []),
        new UIComponent('channel-input', 'ticket/dialogs/inputs/channel-input', []),
        new UIComponent('article-email-from-input', 'ticket/dialogs/inputs/article-email-from-input', []),
        new UIComponent('article-email-recipient-input', 'ticket/dialogs/inputs/article-email-recipient-input', []),
        new UIComponent('go-to-article-cell', 'ticket/table/go-to-article-cell', []),
        new UIComponent('article-attachment-cell', 'ticket/table/article-attachment-cell', []),
        new UIComponent('article-attachment-count', 'ticket/article-attachment-count', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
