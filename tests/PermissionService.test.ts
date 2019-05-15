/* tslint:disable*/
import * as chai from 'chai';
import { UIComponent } from '../src/core/model/UIComponent';
import { UIComponentPermission } from '../src/core/model/UIComponentPermission';
import { PermissionService } from '../src/services/PermissionService';
import { HttpService } from '../src/core/services';
import { OptionsResponse, RequestMethod, ResponseHeader } from '../src/core/api';
import { CRUD } from '../src/core/model';
import { HTTPUtil } from './utils/HTTPUtil';

const expect = chai.expect;
describe('Permission Service', () => {

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

    describe('UI components permission filter for tickets (R)', () => {

        const uiComponents = [
            new UIComponent('test-tag-01', '/somwhere/tag01', [new UIComponentPermission('tickets', [CRUD.READ])]),
            new UIComponent('test-tag-02', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.READ])]),
            new UIComponent('test-tag-03', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.CREATE])]),
            new UIComponent('test-tag-04', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.UPDATE])]),
            new UIComponent('test-tag-05', '/somwhere/tag03', [new UIComponentPermission('faq', [CRUD.READ])]),
            new UIComponent('test-tag-06', '/somwhere/tag04', [new UIComponentPermission('cmdb', [CRUD.DELETE])])
        ];
        let originalOptionsMethod;

        before(() => {

            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'faq') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.POST]);
                } else if (resource === 'cmdb') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.POST]);
                }
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        })

        it('Should retrieve tags where the user has READ permissions for the resource ticket.', async () => {
            const filteredComponents = await PermissionService.getInstance().filterUIComponents('test-token-1234', uiComponents);
            expect(filteredComponents).exist;
            expect(filteredComponents).be.an('array');
            expect(filteredComponents.length).equals(2);
        });
    });

    describe('UI components permission filter for tickets (CR)', () => {

        let uiComponents = [];
        let originalOptionsMethod;

        before(() => {
            uiComponents = [
                new UIComponent('test-tag-01', '/somwhere/tag01', [new UIComponentPermission('tickets', [CRUD.READ, CRUD.CREATE])]),
                new UIComponent('test-tag-02', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.DELETE]),]),
                new UIComponent('test-tag-03', '/somwhere/tag03', [new UIComponentPermission('faq', [CRUD.UPDATE]),]),
                new UIComponent('test-tag-04', '/somwhere/tag04', [new UIComponentPermission('cmdb', [CRUD.DELETE]),])
            ];

            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET, RequestMethod.POST]);
                } else if (resource === 'faq') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'cmdb') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                }
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        })

        it('Should retrieve tags where the user has READ permissions for the resource ticket.', async () => {
            const filteredComponents = await PermissionService.getInstance().filterUIComponents('test-token-1234', uiComponents);
            expect(filteredComponents).exist;
            expect(filteredComponents).be.an('array');
            expect(filteredComponents.length).equals(1);
            expect(filteredComponents[0].tagId).equals('test-tag-01');
        });
    });

    describe('UI components permission filter for components without defined permission', () => {

        let uiComponents = [];
        let originalOptionsMethod;

        before(() => {
            uiComponents = [
                new UIComponent('test-tag-01', '/somwhere/tag01', [new UIComponentPermission('tickets', [])]),
                new UIComponent('test-tag-02', '/somwhere/tag02', [new UIComponentPermission('tickets', []),]),
                new UIComponent('test-tag-02', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.DELETE]),])
            ];

            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                }
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        })

        it('Should retrieve tags where the user has READ permissions for the resource ticket.', async () => {
            const filteredComponents = await PermissionService.getInstance().filterUIComponents('test-token-1234', uiComponents);
            expect(filteredComponents).exist;
            expect(filteredComponents).be.an('array');
            expect(filteredComponents.length).equals(2);
        });
    });

    describe('UI components permission filter for components with multiplie resource permissions', () => {

        let uiComponents = [];
        let originalOptionsMethod;

        before(() => {
            uiComponents = [
                new UIComponent('edit-ticket-component', '/somwhere/tag01', [
                    new UIComponentPermission('tickets', [CRUD.READ, CRUD.UPDATE]),
                    new UIComponentPermission('organisations', [CRUD.READ]),
                    new UIComponentPermission('contacts', [CRUD.READ])
                ]),
                new UIComponent('other-component', 'resource', [new UIComponentPermission('faq', [CRUD.READ])])
            ];

            originalOptionsMethod = HttpService.getInstance().options;
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'organisations') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'contacts') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'faq') {
                    return HTTPUtil.createOptionsResponse([RequestMethod.PATCH]);
                }
            };
        });

        after(() => {
            HttpService.getInstance().options = originalOptionsMethod;
        })

        it('Should retrieve tags no tags if only one permission is given.', async () => {
            const filteredComponents = await PermissionService.getInstance().filterUIComponents('test-token-1234', uiComponents);
            expect(filteredComponents).exist;
            expect(filteredComponents).be.an('array');
            expect(filteredComponents.length).equals(0);
        });
    });

    describe('UI components permission filter for components with multiplie resource permissions', () => {

        let uiComponents = [];
        let originalOptionsMethod;

        before(() => {
            uiComponents = [
                new UIComponent('organisations-create', 'ticket-create', [
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

        it('Should retrieve tags where the user has permissions for the resources.', async () => {
            const filteredComponents = await PermissionService.getInstance().filterUIComponents('test-token-1234', uiComponents);
            expect(filteredComponents).exist;
            expect(filteredComponents).be.an('array');
            expect(filteredComponents.length).equals(3);
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
            ]);

            expect(allowed).true;
        });

        it('The permissions must be checked correctly and allow access if no permissions given', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', []);
            expect(allowed).true;
        });

        it('The permissions must be checked correctly and deny access if permissions are wrong', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('tickets', [CRUD.READ]),
                new UIComponentPermission('organisations', [CRUD.CREATE]),
                new UIComponentPermission('contacts', [CRUD.READ])
            ]);

            expect(allowed).false;
        });

        it('The permissions must be checked correctly and deny access if multiple permissions needed', async () => {
            const allowed = await PermissionService.getInstance().checkPermissions('token1234', [
                new UIComponentPermission('tickets', [CRUD.READ, CRUD.CREATE]),
                new UIComponentPermission('organisations', [CRUD.READ]),
                new UIComponentPermission('contacts', [CRUD.READ])
            ]);

            expect(allowed).false;
        });

    });

});
