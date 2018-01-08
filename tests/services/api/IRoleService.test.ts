import {
    CreateRole,
    CreateRoleRequest,
    CreateRoleResponse,
    HttpError,
    RoleResponse,
    RolesResponse,
    UpdateRole,
    UpdateRoleRequest,
    UpdateRoleResponse,
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

import { Role } from '@kix/core/dist/model';
import { IConfigurationService, IRoleService } from '@kix/core/dist/services';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { container } from '../../../src/Container';

/* tslint:disable*/
chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/roles";

describe('Role Service', () => {
    let nockScope;
    let roleService: IRoleService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        roleService = container.getDIContainer().get<IRoleService>("IRoleService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(roleService).not.undefined;
    });

    describe('Create a valid request to retrieve a role.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildRoleResponse(12345));
        });

        it('should return a role.', async () => {
            const role: Role = await roleService.getRole('', 12345)
            expect(role).not.undefined;
            expect(role.ID).equal(12345);
        });
    });

    describe('Get multiple roles', () => {
        describe('Create a valid request to retrieve all roles.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildRolessResponse(4));
            });

            it('should return a list of roles.', async () => {
                const role: Role[] = await roleService.getRoles('');
                expect(role).not.undefined;
                expect(role).an('array');
                expect(role).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 roles', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildRolessResponse(3));
            });

            it('should return a limited list of 3 roles.', async () => {
                const roles: Role[] = await roleService.getRoles('', 3);
                expect(roles).not.undefined;
                expect(roles).an('array');
                expect(roles).not.empty;
                expect(roles.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of roles.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildRolessResponse(2));
            });

            it('should return a sorted list of roles.', async () => {
                const roles: Role[] = await roleService.getRoles('', null, SortOrder.DOWN);
                expect(roles).not.undefined;
                expect(roles).an('array');
                expect(roles).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of roles witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildRolessResponse(3));
            });

            it('should return a list of roles filtered by changed after.', async () => {
                const roles: Role[] = await roleService.getRoles('', null, null, "20170815");
                expect(roles).not.undefined;
                expect(roles).an('array');
                expect(roles).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted list of roles witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildRolessResponse(6));
            });

            it('should return a limited list of roles filtered by changed after.', async () => {
                const roles: Role[] = await roleService.getRoles('', 6, null, "20170815");
                expect(roles).not.undefined;
                expect(roles).an('array');
                expect(roles.length).equal(6);
                expect(roles).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted, sorted list of roles', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildRolessResponse(6));
            });

            it('should return a limited, sorted list of roles.', async () => {
                const roles: Role[] = await roleService.getRoles('', 6, SortOrder.UP);
                expect(roles).not.undefined;
                expect(roles).an('array');
                expect(roles.length).equal(6);
                expect(roles).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of roles witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildRolessResponse(4));
            });

            it('should return a sorted list of roles filtered by changed after.', async () => {
                const roles: Role[] = await roleService.getRoles('', null, SortOrder.UP, "20170815");
                expect(roles).not.undefined;
                expect(roles).an('array');
                expect(roles).not.empty;
            });
        });
    });

    describe('Create role', () => {
        describe('Create a valid request to create a new role.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateRoleRequest(new CreateRole('role', 'comment', 1)))
                    .reply(200, buildCreateRoleResponse(123456));
            });

            it('should return a the id of the new role.', async () => {
                const userId = await roleService.createRole('', 'role', 'comment', 1);
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateRoleRequest(new CreateRole('role', 'comment', 1)))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await roleService.createRole('', 'role', 'comment', 1)
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update role', () => {
        describe('Create a valid request to update an existing role.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateRoleRequest(new UpdateRole('role', 'comment', 1)))
                    .reply(200, buildUpdateRoleResponse(123456));
            });

            it('should return the id of the role.', async () => {
                const userId = await roleService.updateRole('', 123456, 'role', 'comment', 1);
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing role.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateRoleRequest(new UpdateRole('role', 'comment', 1)))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await roleService.updateRole('', 123456, 'role', 'comment', 1)
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete role', () => {

        describe('Create a valid request to delete a role', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await roleService.deleteRole('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a role.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await roleService.deleteRole('', 123456)
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });

    });

});

function buildRoleResponse(id: number): RoleResponse {
    const response = new RoleResponse();
    response.Role = new Role();
    response.Role.ID = id;
    return response;
}

function buildRolessResponse(roleCount: number): RolesResponse {
    const response = new RolesResponse();
    for (let i = 0; i < roleCount; i++) {
        response.Role.push(new Role());
    }
    return response;
}

function buildCreateRoleResponse(id: number): CreateRoleResponse {
    const response = new CreateRoleResponse();
    response.RoleID = id;
    return response;
}

function buildUpdateRoleResponse(id: number): UpdateRoleResponse {
    const response = new UpdateRoleResponse();
    response.RoleID = id;
    return response;
}