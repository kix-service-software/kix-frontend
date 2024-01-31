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

    public id = 'customer-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent(
            'customer-module-component', '/kix-module-customer$0/webapp/core/CustomerUIModule',
            [
                new UIComponentPermission('organisations', [CRUD.READ], true),
                new UIComponentPermission('contacts', [CRUD.READ], true)
            ]
        ),
        new UIComponent('contact-read-module-component', '/kix-module-customer$0/webapp/core/ContactReadUIModule', [
            new UIComponentPermission('contacts', [CRUD.READ])
        ]),
        new UIComponent('contact-edit-module-component', '/kix-module-customer$0/webapp/core/ContactEditUIModule', [
            new UIComponentPermission('contacts', [CRUD.CREATE]),
        ]),
        new UIComponent(
            'organisation-read-module-component', '/kix-module-customer$0/webapp/core/OrganisationReadUIModule',
            [new UIComponentPermission('organisations', [CRUD.READ])]
        ),
        new UIComponent(
            'organisation-edit-module-component', '/kix-module-customer$0/webapp/core/OrganisationEditUIModule',
            [
                new UIComponentPermission('organisations', [CRUD.CREATE]),
            ]
        )
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('organisations-module', '/kix-module-customer$0/webapp/components/organisation-module', []),
        new UIComponent(
            'contact-assigned-organisations-widget',
            '/kix-module-customer$0/webapp/components/contact-assigned-organisations-widget', []
        ),
        new UIComponent(
            'contact-assigned-config-items-widget',
            '/kix-module-customer$0/webapp/components/contact-assigned-config-items-widget', []
        ),
        new UIComponent(
            'create-new-ticket-cell', '/kix-module-customer$0/webapp/components/create-new-ticket-cell', []
        ),
        new UIComponent('contact-list-widget', '/kix-module-customer$0/webapp/components/contact-list-widget', []),
        new UIComponent(
            'organisation-assigned-contacts-widget',
            '/kix-module-customer$0/webapp/components/organisation-assigned-contacts-widget', []
        ),
        new UIComponent(
            'organisation-assigned-config-items-widget',
            '/kix-module-customer$0/webapp/components/organisation-assigned-config-items-widget', []
        ),
        new UIComponent('contact-input-access', '/kix-module-customer$0/webapp/components/contact-input-access', []),
        new UIComponent('setup-my-organisation', '/kix-module-customer$0/webapp/components/setup-my-organisation', [])
    ];

    public webDependencies: string[] = [
        './customer/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
