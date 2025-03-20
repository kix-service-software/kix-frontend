/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable*/
import * as chai from 'chai';
import { HTTPUtil } from '../utils/HTTPUtil';
import { HttpService } from '../../src/frontend-applications/agent-portal/server/services/HttpService';
import { OptionsResponse } from '../../src/server/model/rest/OptionsResponse';
import { RequestMethod } from '../../src/server/model/rest/RequestMethod';
import { UIComponentPermission } from '../../src/frontend-applications/agent-portal/model/UIComponentPermission';
import { CRUD } from '../../src/server/model/rest/CRUD';
import { PermissionCheckRequest } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/PermissionCheckRequest';
import { AuthenticationEvent } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/AuthenticationEvent';
import { SocketResponse } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/SocketResponse';
import { AuthenticationNamespace } from '../../src/frontend-applications/agent-portal/server/socket-namespaces/AuthenticationNamespace';

const expect = chai.expect;

describe('AuthenticationNamespace', () => {

    before(() => {
        require('../TestSetup');
    });

    describe('Check the permissions', () => {

        let originalOptionsMethod;

        before(async () => {

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
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        });

        // describe('Check Permissions for allow', async () => {
        //     const permissions = [
        //         new UIComponentPermission('tickets', [CRUD.READ]),
        //         new UIComponentPermission('organisations', [CRUD.READ]),
        //         new UIComponentPermission('contacts', [CRUD.READ])
        //     ];
        //     const request = new PermissionCheckRequest('requestId', 'clientId', permissions);

        //     it('the should be positiv', async () => {
        //         const socketRespopnse: SocketResponse = await (AuthenticationNamespace.getInstance() as any).checkPermissions(request);
        //         expect(socketRespopnse).exist;
        //         expect(socketRespopnse.event).equals(AuthenticationEvent.PERMISSION_CHECK_SUCCESS);
        //     });
        // });

        // describe('Check Permissions for deny', async () => {
        //     const permissions = [
        //         new UIComponentPermission('tickets', [CRUD.READ, CRUD.CREATE]),
        //         new UIComponentPermission('organisations', [CRUD.READ]),
        //         new UIComponentPermission('contacts', [CRUD.READ])
        //     ];
        //     const request = new PermissionCheckRequest('requestId', 'clientId', permissions);

        //     it('the should be positiv', async () => {
        //         const socketRespopnse: SocketResponse = await (AuthenticationNamespace.getInstance() as any).checkPermissions(request);
        //         expect(socketRespopnse).exist;
        //         expect(socketRespopnse.event).equals(AuthenticationEvent.PERMISSION_CHECK_FAILED);
        //     });
        // });

    });
});
