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
import { HTTPUtil } from './utils/HTTPUtil';
import { UIComponentPermission } from '../src/frontend-applications/agent-portal/model/UIComponentPermission';
import { CRUD } from '../src/server/model/rest/CRUD';
import { HttpService } from '../src/frontend-applications/agent-portal/server/services/HttpService';
import { OptionsResponse } from '../src/server/model/rest/OptionsResponse';
import { RequestMethod } from '../src/server/model/rest/RequestMethod';
import { PermissionService } from '../src/frontend-applications/agent-portal/server/services/PermissionService';
import { Error } from '../src/server/model/Error';

const expect = chai.expect;
describe('Permission Service', () => {

    before(() => {
        require('./TestSetup');
    });

    describe('Create new UIComponentPermission', () => {

        it('should have the CRUD value 2 for permission READ', () => {
            const uiPermission = new UIComponentPermission('resource', [CRUD.READ]);
            expect(uiPermission).exist;
            expect(uiPermission.value).equals(2);
        });

        it('should have the CRUD value 3 for permission CREATE & READ', () => {
            const uiPermission = new UIComponentPermission('resource', [CRUD.CREATE, CRUD.READ]);
            expect(uiPermission).exist;
            expect(uiPermission.value).equals(3);
        });

        it('should have the CRUD value 7 for permission CREATE & READ & UPDATE', () => {
            const uiPermission = new UIComponentPermission('resource', [CRUD.CREATE, CRUD.READ, CRUD.UPDATE]);
            expect(uiPermission).exist;
            expect(uiPermission.value).equals(7);
        });

        it('should have the CRUD value 15 for permission CREATE & READ & UPDATE & DELETE', () => {
            const uiPermission = new UIComponentPermission('resource', [CRUD.CREATE, CRUD.READ, CRUD.UPDATE, CRUD.DELETE]);
            expect(uiPermission).exist;
            expect(uiPermission.value).equals(15);
        });

        it('should have the CRUD value 9 for permission CREATE & DELETE', () => {
            const uiPermission = new UIComponentPermission('resource', [CRUD.CREATE, CRUD.DELETE]);
            expect(uiPermission).exist;
            expect(uiPermission.value).equals(9);
        });

    });

    describe('Check permissions', () => {

        let originalOptionsMethod;

        before(() => {
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

        it('The permissions must be checked correctly and allow access', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('tickets', [CRUD.READ]),
                new UIComponentPermission('organisations', [CRUD.READ]),
                new UIComponentPermission('contacts', [CRUD.READ])
            ], 'TEST');

            expect(allowed).true;
        });

        it('The permissions must be checked correctly and allow access if no permissions given', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [], 'TEST');
            expect(allowed).true;
        });

        it('The permissions must be checked correctly and deny access if permissions are wrong', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('tickets', [CRUD.READ]),
                new UIComponentPermission('organisations', [CRUD.CREATE]),
                new UIComponentPermission('contacts', [CRUD.READ])
            ], 'TEST');

            expect(allowed).false;
        });

        it('The permissions must be checked correctly and deny access if multiple permissions needed', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('tickets', [CRUD.READ, CRUD.CREATE]),
                new UIComponentPermission('organisations', [CRUD.READ]),
                new UIComponentPermission('contacts', [CRUD.READ])
            ], 'TEST');

            expect(allowed).false;
        });

    });

    describe('Check alternative (OR) permissions', () => {

        let originalOptionsMethod;

        before(() => {
            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'organisations') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.POST]);
                } else if (resource === 'contacts') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else {
                    return HTTPUtil.createOptionsResponse([]);
                }
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        });

        it('The permissions must be checked correctly and allow access', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('organisations', [CRUD.READ]),
                new UIComponentPermission('contacts', [CRUD.READ], true)
            ], 'TEST');

            expect(allowed).true;
        });

        it('The permissions must be checked correctly and allow access', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('organisations', [CRUD.READ]),
                new UIComponentPermission('tickets', [CRUD.READ], true),
                new UIComponentPermission('faq', [CRUD.READ], true),
                new UIComponentPermission('contacts', [CRUD.READ], true)
            ], 'TEST');

            expect(allowed).true;
        });

        it('The permissions must be checked correctly and allow access', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('contacts', [CRUD.READ]),
                new UIComponentPermission('tickets', [CRUD.READ], true),
                new UIComponentPermission('faq', [CRUD.READ], true),
                new UIComponentPermission('organisations', [CRUD.READ], true)
            ], 'TEST');

            expect(allowed).true;
        });

        it('The permissions must be checked correctly and deny access', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('organisations', [CRUD.UPDATE]),
                new UIComponentPermission('contacts', [CRUD.CREATE], true)
            ], 'TEST');

            expect(allowed).false;
        });

        it('The permissions must be checked correctly and deny access', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('contacts', [CRUD.CREATE]),
                new UIComponentPermission('tickets', [CRUD.READ], true),
                new UIComponentPermission('faq', [CRUD.READ], true),
                new UIComponentPermission('organisations', [CRUD.READ], true)
            ], 'TEST');

            expect(allowed).false;
        });

        it('The permissions must be checked correctly and deny access', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('tickets', [CRUD.READ], true),
                new UIComponentPermission('faq', [CRUD.READ], true),
                new UIComponentPermission('organisations', [CRUD.READ], true)
            ], 'TEST');

            expect(allowed).false;
        });

        it('The permissions must be checked correctly and allow access (no permissions given)', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [], 'TEST');
            expect(allowed).true;
        });

    });

    describe('Options request with failure.', () => {

        let originalOptionsMethod;

        before(() => {

            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                throw new Error('error', 'error');
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        })

        it('Should return true if no permissions are given and the option request provides errors.', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('test-token-1234', [], 'TEST');
            expect(allowed).true;
        });

        it('Should return false if permissions are given and the option request provides errors.', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('test-token-1234', [new UIComponentPermission('somewhere', [CRUD.READ])], 'TEST');
            expect(allowed).false;
        });
    });

});
