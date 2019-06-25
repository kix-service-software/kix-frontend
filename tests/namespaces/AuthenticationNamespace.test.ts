/* tslint:disable*/
import * as chai from 'chai';
import { HttpService } from '../../src/core/services';
import { OptionsResponse, RequestMethod } from '../../src/core/api';
import { SocketResponse } from '../../src/core/common';
import { HTTPUtil } from '../utils/HTTPUtil';
import { PermissionCheckRequest, CRUD, ISocketResponse, AuthenticationEvent } from '../../src/core/model';
import { UIComponentPermission } from '../../src/core/model/UIComponentPermission';
import { AuthenticationNamespace } from '../../src/socket-namespaces/AuthenticationNamespace';

const expect = chai.expect;

describe('AuthenticationNamespace', () => {

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

        describe('Check Permissions for allow', async () => {
            const permissions = [
                new UIComponentPermission('tickets', [CRUD.READ]),
                new UIComponentPermission('organisations', [CRUD.READ]),
                new UIComponentPermission('contacts', [CRUD.READ])
            ];
            const request = new PermissionCheckRequest('token1234', 'rquestId', 'clientId', permissions);


            it('the should be positiv', async () => {
                const socketRespopnse: SocketResponse = await (AuthenticationNamespace.getInstance() as any).checkPermissions(request);
                expect(socketRespopnse).exist;
                expect(socketRespopnse.event).equals(AuthenticationEvent.PERMISSION_CHECK_SUCCESS);
            });
        });

        describe('Check Permissions for deny', async () => {
            const permissions = [
                new UIComponentPermission('tickets', [CRUD.READ, CRUD.CREATE]),
                new UIComponentPermission('organisations', [CRUD.READ]),
                new UIComponentPermission('contacts', [CRUD.READ])
            ];
            const request = new PermissionCheckRequest('token1234', 'rquestId', 'clientId', permissions);


            it('the should be positiv', async () => {
                const socketRespopnse: SocketResponse = await (AuthenticationNamespace.getInstance() as any).checkPermissions(request);
                expect(socketRespopnse).exist;
                expect(socketRespopnse.event).equals(AuthenticationEvent.PERMISSION_CHECK_FAILED);
            });
        });

    });
});
