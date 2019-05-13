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
                    const response = {
                        headers: {
                            Allow: `${RequestMethod.GET}`
                        }
                    };
                    return new OptionsResponse(response as any);
                } else if (resource === 'faq') {
                    const response = {
                        headers: {
                            Allow: `${RequestMethod.POST}`
                        }
                    };
                    return new OptionsResponse(response as any);
                } else if (resource === 'cmdb') {
                    const response = {
                        headers: {
                            Allow: `${RequestMethod.POST}`
                        }
                    };
                    return new OptionsResponse(response as any);
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

        const uiComponents = [
            new UIComponent('test-tag-01', '/somwhere/tag01', [new UIComponentPermission('tickets', [CRUD.READ, CRUD.CREATE])]),
            new UIComponent('test-tag-02', '/somwhere/tag02', [new UIComponentPermission('tickets', [CRUD.DELETE]),]),
            new UIComponent('test-tag-03', '/somwhere/tag03', [new UIComponentPermission('faq', [CRUD.UPDATE]),]),
            new UIComponent('test-tag-04', '/somwhere/tag04', [new UIComponentPermission('cmdb', [CRUD.DELETE]),])
        ];

        before(() => {
            HttpService.getInstance().options = async (token: string, resource: string): Promise<OptionsResponse> => {
                if (resource === 'tickets') {
                    const response = {
                        headers: {
                            Allow: `${RequestMethod.GET},${RequestMethod.POST}`
                        }
                    };
                    return new OptionsResponse(response as any);
                } else if (resource === 'faq') {
                    const response = {
                        headers: {
                            Allow: `${RequestMethod.GET}`
                        }
                    };
                    return new OptionsResponse(response as any);
                } else if (resource === 'cmdb') {
                    const response = {
                        headers: {
                            Allow: `${RequestMethod.GET}`
                        }
                    };
                    return new OptionsResponse(response as any);
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

});