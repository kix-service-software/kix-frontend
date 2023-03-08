/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable*/
import * as chai from 'chai';
import { HTTPUtil } from '../utils/HTTPUtil';

import { AgentPortalExtensions } from '../../src/frontend-applications/agent-portal/server/extensions/AgentPortalExtensions';
import { RequestMethod } from '../../src/server/model/rest/RequestMethod';
import { HttpService } from '../../src/frontend-applications/agent-portal/server/services/HttpService';
import { OptionsResponse } from '../../src/server/model/rest/OptionsResponse';
import { UIComponentPermission } from '../../src/frontend-applications/agent-portal/model/UIComponentPermission';
import { CRUD } from '../../src/server/model/rest/CRUD';
import { MenuEntry } from '../../src/frontend-applications/agent-portal/model/MenuEntry';
import { MainMenuNamespace } from '../../src/frontend-applications/agent-portal/modules/agent-portal/server/MainMenuNamespace';
import { IMainMenuExtension } from '../../src/frontend-applications/agent-portal/server/extensions/IMainMenuExtension';
import { PluginService } from '../../src/server/services/PluginService';

const expect = chai.expect;
describe('MainMenuNamespace', () => {

    let originalExtensionMethod;
    let originalOptionsMethod;

    let extensions: any[] = [];
    const menuConfigurations: MenuEntry[] = [
        new MenuEntry(null, null, 'tickets', []),
        new MenuEntry(null, null, 'faq', []),
        new MenuEntry(null, null, 'cmdb', []),
        new MenuEntry(null, null, 'organisations', []),
        new MenuEntry(null, null, 'contacts', [])
    ];

    before(() => {

        originalExtensionMethod = PluginService.getInstance().getExtensions;
        originalOptionsMethod = HttpService.getInstance().options;

        PluginService.getInstance().getExtensions = async <T>(extensionId: string): Promise<T[]> => {
            if (extensionId === AgentPortalExtensions.MAIN_MENU) {
                return extensions;
            }
        };

        HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
            if (resource === 'tickets') {
                return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
            } else if (resource === 'organisations') {
                return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
            } else if (resource === 'contacts') {
                return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
            } else {
                return HTTPUtil.createOptionsResponse([]);
            }
        };
    });

    after(() => {
        PluginService.getInstance().getExtensions = originalExtensionMethod;
        HttpService.getInstance().options = originalOptionsMethod;
    });

    describe('Deliver menu entries with correct permissions', () => {
        before(async () => {
            extensions.push(createMenuExtension('tickets', [new UIComponentPermission('tickets', [CRUD.READ])]));
            extensions.push(createMenuExtension('faq', [new UIComponentPermission('faq', [CRUD.READ])]));
            extensions.push(createMenuExtension('cmdb', [new UIComponentPermission('cmdb', [CRUD.READ])]));
            extensions.push(createMenuExtension('organisations', [new UIComponentPermission('organisations', [CRUD.READ])]));
            extensions.push(createMenuExtension('contacts', [new UIComponentPermission('contacts', [CRUD.READ])]));
        });

        after(() => {
            extensions = [];
        });

        it('should retrieve menus with with needed permissions', async () => {
            const entries: MenuEntry[] = await (MainMenuNamespace.getInstance() as any).getMenuEntries('token123', extensions, menuConfigurations);
            expect(entries).exist;
            expect(entries).an('array');
            expect(entries.length).equals(3);
        });

    });

    describe('Deliver menu entries with correct permissions (multiple)', () => {
        before(async () => {
            extensions.push(createMenuExtension('tickets', [new UIComponentPermission('tickets', [CRUD.READ])]));
            extensions.push(createMenuExtension('faq', [new UIComponentPermission('faq', [CRUD.READ])]));
            extensions.push(createMenuExtension('cmdb', [new UIComponentPermission('cmdb', [CRUD.READ])]));
            extensions.push(createMenuExtension('organisations', [new UIComponentPermission('organisations', [CRUD.READ, CRUD.CREATE])]));
            extensions.push(createMenuExtension('contacts', [new UIComponentPermission('contacts', [CRUD.READ])]));
        });

        after(() => {
            extensions = [];
        });

        it('should retrieve menus with with needed permissions', async () => {
            const entries: MenuEntry[] = await (MainMenuNamespace.getInstance() as any).getMenuEntries('token123', extensions, menuConfigurations);
            expect(entries).exist;
            expect(entries).an('array');
            expect(entries.length).equals(2);
        });

    });

    describe('Deliver menu entries with correct permissions (non permissions needed)', () => {
        before(async () => {
            extensions.push(createMenuExtension('tickets', [new UIComponentPermission('tickets', [])]));
            extensions.push(createMenuExtension('faq', [new UIComponentPermission('faq', [])]));
            extensions.push(createMenuExtension('cmdb', [new UIComponentPermission('cmdb')]));
            extensions.push(createMenuExtension('organisations', [new UIComponentPermission('organisations', [CRUD.READ, CRUD.CREATE])]));
            extensions.push(createMenuExtension('contacts', [new UIComponentPermission('contacts', [CRUD.READ])]));
        });

        after(() => {
            extensions = [];
        });

        it('should retrieve menus with with needed permissions', async () => {
            const entries: MenuEntry[] = await (MainMenuNamespace.getInstance() as any).getMenuEntries('token123', extensions, menuConfigurations);
            expect(entries).exist;
            expect(entries).an('array');
            expect(entries.length).equals(4);
        });

    });

});

function createMenuExtension(mainContextId: string, permissions: UIComponentPermission[]): IMainMenuExtension {
    return {
        contextIds: [],
        icon: '',
        mainContextId,
        permissions,
        primaryMenu: true,
        text: '',
        orderRang: 100
    }
}