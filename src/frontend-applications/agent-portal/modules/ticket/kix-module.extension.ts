/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from "../../model/IKIXModuleExtension";
import { UIComponent } from "../../model/UIComponent";
import { UIComponentPermission } from "../../model/UIComponentPermission";
import { CRUD } from "../../../../server/model/rest/CRUD";

class Extension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'ticket-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('ticket-admin-module-component', '/kix-module-ticket$0/webapp/core/TicketAdminUIModule',
            [
                new UIComponentPermission('system/ticket/queues', [CRUD.CREATE], true),
                new UIComponentPermission('system/ticket/queues/*', [CRUD.UPDATE], true),
                new UIComponentPermission('system/ticket/types', [CRUD.CREATE], true),
                new UIComponentPermission('system/ticket/types/*', [CRUD.UPDATE], true),
                new UIComponentPermission('system/ticket/states', [CRUD.CREATE], true),
                new UIComponentPermission('system/ticket/states/*', [CRUD.UPDATE], true),
                new UIComponentPermission('system/ticket/priorities', [CRUD.CREATE], true),
                new UIComponentPermission('system/ticket/priorities/*', [CRUD.UPDATE], true)
            ]
        ),
        new UIComponent('ticket-read-module-component', '/kix-module-ticket$0/webapp/core/TicketReadUIModule',
            [
                new UIComponentPermission('tickets', [CRUD.READ])
            ]
        ),
        new UIComponent('ticket-create-module-component', '/kix-module-ticket$0/webapp/core/TicketCreateUIModule',
            [
                new UIComponentPermission('tickets', [CRUD.CREATE])
            ]
        ),
        new UIComponent('ticket-update-module-component', '/kix-module-ticket$0/webapp/core/TicketUpdateUIModule',
            [
                new UIComponentPermission('tickets/*', [CRUD.UPDATE]),
            ]
        ),
        new UIComponent(
            'ticket-article-create-module-component',
            '/kix-module-ticket$0/webapp/core/ArticleCreateUIModule',
            [
                new UIComponentPermission('tickets/*/articles', [CRUD.CREATE])
            ]
        )
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'article-attachment-cell', '/kix-module-ticket$0/webapp/components/article-attachment-cell', []
        ),
        new UIComponent(
            'article-attachment-count', '/kix-module-ticket$0/webapp/components/article-attachment-count', []
        ),
        new UIComponent(
            'article-email-from-input', '/kix-module-ticket$0/webapp/components/article-email-from-input', []
        ),
        new UIComponent(
            'article-email-recipient-input', '/kix-module-ticket$0/webapp/components/article-email-recipient-input', []
        ),
        new UIComponent('article-receiver-list', '/kix-module-ticket$0/webapp/components/article-receiver-list', []),
        new UIComponent('channel-input', '/kix-module-ticket$0/webapp/components/channel-input', []),
        new UIComponent('customer-visible-input', '/kix-module-ticket$0/webapp/components/customer-visible-input', []),
        new UIComponent('edit-ticket-dialog', '/kix-module-ticket$0/webapp/components/edit-ticket-dialog', []),
        new UIComponent(
            'edit-ticket-priority-dialog', '/kix-module-ticket$0/webapp/components/edit-ticket-priority-dialog', []
        ),
        new UIComponent(
            'edit-ticket-queue-dialog', '/kix-module-ticket$0/webapp/components/edit-ticket-queue-dialog', []
        ),
        new UIComponent(
            'edit-ticket-state-dialog', '/kix-module-ticket$0/webapp/components/edit-ticket-state-dialog', []
        ),
        new UIComponent(
            'edit-ticket-type-dialog', '/kix-module-ticket$0/webapp/components/edit-ticket-type-dialog', []
        ),
        new UIComponent('go-to-article-cell', '/kix-module-ticket$0/webapp/components/go-to-article-cell', []),
        new UIComponent(
            'new-ticket-article-dialog', '/kix-module-ticket$0/webapp/components/new-ticket-article-dialog', []
        ),
        new UIComponent('new-ticket-dialog', '/kix-module-ticket$0/webapp/components/new-ticket-dialog', []),
        new UIComponent(
            'new-ticket-priority-dialog', '/kix-module-ticket$0/webapp/components/new-ticket-priority-dialog', []
        ),
        new UIComponent(
            'new-ticket-queue-dialog', '/kix-module-ticket$0/webapp/components/new-ticket-queue-dialog', []
        ),
        new UIComponent(
            'new-ticket-state-dialog', '/kix-module-ticket$0/webapp/components/new-ticket-state-dialog', []
        ),
        new UIComponent('new-ticket-type-dialog', '/kix-module-ticket$0/webapp/components/new-ticket-type-dialog', []),
        new UIComponent('queue-input-follow-up', '/kix-module-ticket$0/webapp/components/queue-input-follow-up', []),
        new UIComponent('search-ticket-dialog', '/kix-module-ticket$0/webapp/components/search-ticket-dialog', []),
        new UIComponent(
            'ticket-admin-priorities', '/kix-module-ticket$0/webapp/components/ticket-admin-priorities', []
        ),
        new UIComponent('ticket-admin-queues', '/kix-module-ticket$0/webapp/components/ticket-admin-queues', []),
        new UIComponent('ticket-admin-states', '/kix-module-ticket$0/webapp/components/ticket-admin-states', []),
        new UIComponent('ticket-admin-templates', '/kix-module-ticket$0/webapp/components/ticket-admin-templates', []),
        new UIComponent('ticket-admin-types', '/kix-module-ticket$0/webapp/components/ticket-admin-types', []),
        new UIComponent(
            'ticket-article-attachment', '/kix-module-ticket$0/webapp/components/ticket-article-attachment', []
        ),
        new UIComponent(
            'ticket-article-attachment-list',
            '/kix-module-ticket$0/webapp/components/ticket-article-attachment-list', []
        ),
        new UIComponent('ticket-article-content', '/kix-module-ticket$0/webapp/components/ticket-article-content', []),
        new UIComponent('ticket-article-details', '/kix-module-ticket$0/webapp/components/ticket-article-details', []),
        new UIComponent(
            'ticket-article-metadata', '/kix-module-ticket$0/webapp/components/ticket-article-metadata', []
        ),
        new UIComponent('ticket-chart-widget', '/kix-module-ticket$0/webapp/components/ticket-chart-widget', []),
        new UIComponent(
            'ticket-description-widget', '/kix-module-ticket$0/webapp/components/ticket-description-widget', []
        ),
        new UIComponent(
            'ticket-dynamic-field-label', '/kix-module-ticket$0/webapp/components/ticket-dynamic-field-label', []
        ),
        new UIComponent(
            'ticket-dynamic-fields-container',
            '/kix-module-ticket$0/webapp/components/ticket-dynamic-fields-container', []
        ),
        new UIComponent('ticket-history-widget', '/kix-module-ticket$0/webapp/components/ticket-history-widget', []),
        new UIComponent('ticket-info-widget', '/kix-module-ticket$0/webapp/components/ticket-info-widget', []),
        new UIComponent('ticket-input-contact', '/kix-module-ticket$0/webapp/components/ticket-input-contact', []),
        new UIComponent(
            'ticket-input-organisation', '/kix-module-ticket$0/webapp/components/ticket-input-organisation', []
        ),
        new UIComponent('ticket-input-state', '/kix-module-ticket$0/webapp/components/ticket-input-state', []),
        new UIComponent(
            'ticket-input-state-pending', '/kix-module-ticket$0/webapp/components/ticket-input-state-pending', []
        ),
        new UIComponent('ticket-list-module', '/kix-module-ticket$0/webapp/components/ticket-list-module', []),
        new UIComponent('ticket-module', '/kix-module-ticket$0/webapp/components/ticket-module', []),
        new UIComponent(
            'ticket-priority-info-widget', '/kix-module-ticket$0/webapp/components/ticket-priority-info-widget', []
        ),
        new UIComponent('ticket-queue-explorer', '/kix-module-ticket$0/webapp/components/ticket-queue-explorer', []),
        new UIComponent(
            'ticket-queue-info-widget', '/kix-module-ticket$0/webapp/components/ticket-queue-info-widget', []
        ),
        new UIComponent('ticket-queue-signature', '/kix-module-ticket$0/webapp/components/ticket-queue-signature', []),
        new UIComponent(
            'ticket-state-assigned-textmodules',
            '/kix-module-ticket$0/webapp/components/ticket-state-assigned-textmodules', []
        ),
        new UIComponent(
            'ticket-state-info-widget', '/kix-module-ticket$0/webapp/components/ticket-state-info-widget', []
        ),
        new UIComponent(
            'ticket-type-assigned-textmodules',
            '/kix-module-ticket$0/webapp/components/ticket-type-assigned-textmodules', []
        ),
        new UIComponent('ticket-type-info-widget', '/kix-module-ticket$0/webapp/components/ticket-type-info-widget', [])
    ];

    public webDependencies: string[] = [
        './ticket/webapp'
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
