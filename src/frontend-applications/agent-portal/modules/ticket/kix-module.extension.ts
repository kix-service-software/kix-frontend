/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'ticket-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('ticket-admin-module-component', '/kix-module-ticket$0/webapp/core/TicketAdminUIModule',
            [
                new UIComponentPermission('system/ticket/queues', [CRUD.CREATE], true),
                new UIComponentPermission('system/ticket/types', [CRUD.CREATE], true),
                new UIComponentPermission('system/ticket/states', [CRUD.CREATE], true),
                new UIComponentPermission('system/ticket/priorities', [CRUD.CREATE], true)
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
                new UIComponentPermission('tickets', [CRUD.CREATE]),
            ]
        ),
        new UIComponent(
            'ticket-article-create-module-component',
            '/kix-module-ticket$0/webapp/core/ArticleCreateUIModule', []
        )
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'article-attachment-cell', '/kix-module-ticket$0/webapp/components/article-attachment-cell', []
        ),
        new UIComponent(
            'article-attachment-count', '/kix-module-ticket$0/webapp/components/article-attachment-count', []
        ),
        new UIComponent('article-receiver-list', '/kix-module-ticket$0/webapp/components/article-receiver-list', []),
        new UIComponent('channel-form-input', '/kix-module-ticket$0/webapp/components/inputs/channel-form-input', []),
        new UIComponent('go-to-article-cell', '/kix-module-ticket$0/webapp/components/go-to-article-cell', []),
        new UIComponent('queue-input-follow-up', '/kix-module-ticket$0/webapp/components/queue-input-follow-up', []),
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
        new UIComponent('ticket-input-contact', '/kix-module-ticket$0/webapp/components/ticket-input-contact', []),
        new UIComponent(
            'ticket-input-organisation', '/kix-module-ticket$0/webapp/components/ticket-input-organisation', []
        ),
        new UIComponent(
            'ticket-input-state-pending', '/kix-module-ticket$0/webapp/components/ticket-input-state-pending', []
        ),
        new UIComponent('ticket-list-module', '/kix-module-ticket$0/webapp/components/ticket-list-module', []),
        new UIComponent('ticket-module', '/kix-module-ticket$0/webapp/components/ticket-module', []),
        new UIComponent('ticket-queue-explorer', '/kix-module-ticket$0/webapp/components/ticket-queue-explorer', []),
        new UIComponent('ticket-queue-signature', '/kix-module-ticket$0/webapp/components/ticket-queue-signature', []),
        new UIComponent(
            'ticket-state-info-widget', '/kix-module-ticket$0/webapp/components/ticket-state-info-widget', []
        ),
        new UIComponent(
            'ticket-communication-widget', '/kix-module-ticket$0/webapp/components/ticket-communication-widget', []
        ),
    ];

    public webDependencies: string[] = [
        './ticket/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
