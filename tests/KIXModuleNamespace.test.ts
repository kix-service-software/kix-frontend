/* tslint:disable*/
import * as chai from 'chai';
import { UIComponent } from '../src/core/model/UIComponent';
import { UIComponentPermission } from '../src/core/model/UIComponentPermission';
import { HttpService } from '../src/core/services';
import { OptionsResponse, RequestMethod } from '../src/core/api';
import { CRUD, LoadKIXModulesResponse } from '../src/core/model';
import { PluginService } from '../src/services';
import { KIXExtensions, IKIXModuleExtension } from '../src/core/extensions';
import { KIXModuleNamespace } from '../src/socket-namespaces/KIXModuleNamespace';
import { SocketResponse } from '../src/core/common';

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
                if (extensionId === KIXExtensions.MODULES) {
                    return extensions;
                }
            };

            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'organisations') {
                    return createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'contacts') {
                    return createOptionsResponse([RequestMethod.GET]);
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
            expect(uiModule.uiComponents.length).equals(4);
        });
    });

});

function createOptionsResponse(methods: RequestMethod[]): OptionsResponse {
    const response = {
        headers: {
            Allow: methods.join(',')
        }
    };

    return new OptionsResponse(response as any);
}


class TestExtension1 implements IKIXModuleExtension {

    public tags: Array<[string, string]>;

    public id = 'TestExtension1';

    public external: boolean = false;

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

    public tags: Array<[string, string]>;

    public id = 'TestExtension2';

    public external: boolean = false;

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
