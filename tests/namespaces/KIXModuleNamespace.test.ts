/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable*/
import * as chai from 'chai';
import { HTTPUtil } from '../utils/HTTPUtil';
import { SocketResponse } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/SocketResponse';
import { LoadKIXModulesResponse } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/LoadKIXModulesResponse';
import { PluginService } from '../../src/server/services/PluginService';
import { HttpService } from '../../src/frontend-applications/agent-portal/server/services/HttpService';
import { OptionsResponse } from '../../src/server/model/rest/OptionsResponse';
import { RequestMethod } from '../../src/server/model/rest/RequestMethod';
import { IKIXModuleExtension } from '../../src/frontend-applications/agent-portal/model/IKIXModuleExtension';
import { UIComponent } from '../../src/frontend-applications/agent-portal/model/UIComponent';
import { UIComponentPermission } from '../../src/frontend-applications/agent-portal/model/UIComponentPermission';
import { CRUD } from '../../src/server/model/rest/CRUD';
import { AgentPortalExtensions } from '../../src/frontend-applications/agent-portal/server/extensions/AgentPortalExtensions';
import { KIXModuleNamespace } from '../../src/frontend-applications/agent-portal/server/socket-namespaces/KIXModuleNamespace';

const expect = chai.expect;
describe('KIXModuleNamespace', () => {

    describe('Deliver tags with correct permissions', () => {

        let originalExtensionMethod;
        let originalOptionsMethod;

        let socketRespopnse: SocketResponse<LoadKIXModulesResponse>;

        const extensions: any[] = [];

        before(async () => {
            originalExtensionMethod = PluginService.getInstance().getExtensions;
            PluginService.getInstance().getExtensions = async <T>(extensionId: string): Promise<T[]> => {
                if (extensionId === AgentPortalExtensions.MODULES) {
                    return extensions;
                }
            };

            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'organisations') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'contacts') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                }
            };

            extensions.push(new TestExtension1());
            extensions.push(new TestExtension2());

            socketRespopnse = await (KIXModuleNamespace.getInstance() as any).loadModules({ token: '1234' });
        });

        after(() => {
            PluginService.getInstance().getExtensions = originalExtensionMethod;
            HttpService.getInstance().options = originalOptionsMethod;
        });

        it('socket response should contain data.', async () => {
            expect(socketRespopnse).exist;
            expect(socketRespopnse.data).exist;
        });

        it('socket response data should contain modules.', () => {
            expect(socketRespopnse.data.modules).exist;
            expect(socketRespopnse.data.modules).an('array');
            expect(socketRespopnse.data.modules.length).equals(extensions.length);
        });

        it('TestExtension1 should contain 1 initialization component.', () => {
            const uiModule = socketRespopnse.data.modules.find((m) => m.id === 'TestExtension1');
            expect(uiModule).exist;
            expect(uiModule.initComponents).exist;
            expect(uiModule.initComponents).an('array');
            expect(uiModule.initComponents.length).equals(1);
        });

        it('TestExtension1 should contain 2 ui components.', () => {
            const uiModule = socketRespopnse.data.modules.find((m) => m.id === 'TestExtension1');
            expect(uiModule.uiComponents).exist;
            expect(uiModule.uiComponents).an('array');
            expect(uiModule.uiComponents.length).equals(2);
        });

        it('TestExtension2 should contain 2 init components.', () => {
            const uiModule = socketRespopnse.data.modules.find((m) => m.id === 'TestExtension2');
            expect(uiModule.initComponents).exist;
            expect(uiModule.initComponents).an('array');
            expect(uiModule.initComponents.length).equals(2);
        });

        it('TestExtension2 should contain 3 ui components.', () => {
            const uiModule = socketRespopnse.data.modules.find((m) => m.id === 'TestExtension2');
            expect(uiModule.uiComponents).exist;
            expect(uiModule.uiComponents).an('array');
            expect(uiModule.uiComponents.length).equals(3);
        });
    });

});

class TestExtension1 implements IKIXModuleExtension {

    public applications: string[] = [];

    public tags: Array<[string, string]>;

    public id = 'TestExtension1';

    public external: boolean = false;

    public webDependencies: string[] = [];

    public initComponents: UIComponent[] = [
        new UIComponent('tickets-module', 'ticket-component', [
            new UIComponentPermission('tickets', [CRUD.READ])
        ]),
        new UIComponent('tickets-admin-module', 'ticket-admin-component', [
            new UIComponentPermission('tickets', [CRUD.CREATE, CRUD.UPDATE, CRUD.DELETE])
        ])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('tickets-create', 'ticket-create', [
            new UIComponentPermission('tickets', [CRUD.CREATE])
        ]),
        new UIComponent('tickets-update', 'ticket-update', [
            new UIComponentPermission('tickets', [CRUD.UPDATE])
        ]),
        new UIComponent('tickets-details', 'ticket-details', [
            new UIComponentPermission('tickets', [CRUD.READ])

        ]),
        new UIComponent('tickets-info', 'ticket-info', [
            new UIComponentPermission('tickets', [CRUD.READ])
        ])
    ];

}

class TestExtension2 implements IKIXModuleExtension {

    public applications: string[] = [];

    public tags: Array<[string, string]>;

    public id = 'TestExtension2';

    public external: boolean = false;

    public webDependencies: string[] = [];

    public initComponents: UIComponent[] = [
        new UIComponent('organisations-module', 'organisations-component', [
            new UIComponentPermission('organisations', [CRUD.READ])
        ]),
        new UIComponent('organisations-admin-module', 'organisations-admin-component', [
            new UIComponentPermission('organisations', [CRUD.CREATE, CRUD.UPDATE])
        ]),
        new UIComponent('contact-module', 'contact-component', [
            new UIComponentPermission('contacts', [CRUD.READ])
        ])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('organisations-create', 'organisations-create', [
            new UIComponentPermission('tickets', [CRUD.CREATE]),
            new UIComponentPermission('organisations', [CRUD.READ])
        ]),
        new UIComponent('tickets-update', 'ticket-update', [
            new UIComponentPermission('tickets', [CRUD.UPDATE])
        ]),
        new UIComponent('contacts-details', 'contacts-details', [
            new UIComponentPermission('contacts', [CRUD.READ])
        ]),
        new UIComponent('tickets-info', 'ticket-info', [
            new UIComponentPermission('tickets', [CRUD.READ]),
            new UIComponentPermission('organisations', [CRUD.READ]),
            new UIComponentPermission('contacts', [CRUD.READ])
        ]),
        new UIComponent('tickets-info-2', 'ticket-info-2', [
            new UIComponentPermission('tickets', [CRUD.READ]),
            new UIComponentPermission('organisations', [CRUD.READ]),
            new UIComponentPermission('contacts', [CRUD.READ, CRUD.UPDATE])
        ]),
        new UIComponent('contact-info-2', 'contact-info-2', [
            new UIComponentPermission('organisations', [CRUD.READ]),
            new UIComponentPermission('contacts', [CRUD.READ])
        ])
    ];

}
