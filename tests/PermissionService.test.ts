/* tslint:disable*/
import * as chai from 'chai';
import { UIComponent } from '../src/core/model/UIComponent';
import { UIComponentPermission } from '../src/core/model/UIComponentPermission';
import { PermissionService } from '../src/services/PermissionService';
import { HttpService } from '../src/core/services';
import { OptionsResponse, RequestMethod } from '../src/core/api';
import { CRUD } from '../src/core/model';

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
            new UIComponent('test-tag-01', '/somwhere/tag01', [new UIComponentPermission('tickets', [CRUD.READ]),]),
            new UIComponent('test-tag-02', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.READ]),]),
            new UIComponent('test-tag-03', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.CREATE]),]),
            new UIComponent('test-tag-04', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.UPDATE]),]),
            new UIComponent('test-tag-05', '/somwhere/tag03', [new UIComponentPermission('faq', [CRUD.READ]),]),
            new UIComponent('test-tag-06', '/somwhere/tag04', [new UIComponentPermission('cmdb', [CRUD.DELETE]),])
        ];

        before(() => {
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'faq') {
                    return createOptionsResponse([RequestMethod.POST]);
                } else if (resource === 'cmdb') {
                    return createOptionsResponse([RequestMethod.POST]);
                }
            };
        });

        it('Should retrieve tags where the user has READ permissions for the resource ticket.', async () => {
            const filteredComponents = await PermissionService.getInstance().filterUIComponents('test-token-1234', uiComponents);
            expect(filteredComponents).exist;
            expect(filteredComponents).be.an('array');
            expect(filteredComponents.length).equals(2);
        });
    });

    describe('UI components permission filter for tickets (CR)', () => {

        let uiComponents = [];

        before(() => {
            uiComponents = [
                new UIComponent('test-tag-01', '/somwhere/tag01', [new UIComponentPermission('tickets', [CRUD.READ, CRUD.CREATE])]),
                new UIComponent('test-tag-02', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.DELETE]),]),
                new UIComponent('test-tag-03', '/somwhere/tag03', [new UIComponentPermission('faq', [CRUD.UPDATE]),]),
                new UIComponent('test-tag-04', '/somwhere/tag04', [new UIComponentPermission('cmdb', [CRUD.DELETE]),])
            ];

            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return createOptionsResponse([RequestMethod.GET, RequestMethod.POST]);
                } else if (resource === 'faq') {
                    return createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'cmdb') {
                    return createOptionsResponse([RequestMethod.GET]);
                }
            };
        });

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

        before(() => {
            uiComponents = [
                new UIComponent('test-tag-01', '/somwhere/tag01', [new UIComponentPermission('tickets', [])]),
                new UIComponent('test-tag-02', '/somwhere/tag02', [new UIComponentPermission('tickets', []),]),
                new UIComponent('test-tag-02', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.DELETE]),])
            ];

            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return createOptionsResponse([RequestMethod.GET]);
                }
            };
        });

        it('Should retrieve tags where the user has READ permissions for the resource ticket.', async () => {
            const filteredComponents = await PermissionService.getInstance().filterUIComponents('test-token-1234', uiComponents);
            expect(filteredComponents).exist;
            expect(filteredComponents).be.an('array');
            expect(filteredComponents.length).equals(2);
        });
    });

    describe('UI components permission filter for components with multiplie resource permissions', () => {

        let uiComponents = [];

        before(() => {
            uiComponents = [
                new UIComponent('edit-ticket-component', '/somwhere/tag01', [
                    new UIComponentPermission('tickets', [CRUD.READ, CRUD.UPDATE]),
                    new UIComponentPermission('organisations', [CRUD.READ]),
                    new UIComponentPermission('contacts', [CRUD.READ])
                ]),
                new UIComponent('other-component', 'resource', [new UIComponentPermission('faq', [CRUD.READ])])
            ];

            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    return createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'organisations') {
                    return createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'contacts') {
                    return createOptionsResponse([RequestMethod.GET]);
                } else if (resource === 'faq') {
                    return createOptionsResponse([RequestMethod.PATCH]);
                }
            };
        });

        it('Should retrieve tags where the user has READ permissions for the resource ticket.', async () => {
            const filteredComponents = await PermissionService.getInstance().filterUIComponents('test-token-1234', uiComponents);
            expect(filteredComponents).exist;
            expect(filteredComponents).be.an('array');
            expect(filteredComponents.length).equals(1);
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