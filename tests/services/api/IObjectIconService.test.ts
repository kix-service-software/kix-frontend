/* tslint:disable*/
import { ObjectIconsResponse } from '@kix/core/dist/api';
import { ObjectIcon } from '@kix/core/dist/model';
import { IConfigurationService, IObjectIconService } from '@kix/core/dist/services';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { ServiceContainer } from '@kix/core/dist/common';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = '/objecticons';

describe('ObjectIcon Service', () => {
    let nockScope;
    let objectIconService: IObjectIconService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        require('../../TestSetup');
        const nock = require('nock');
        objectIconService = ServiceContainer.getInstance().getClass<IObjectIconService>('IObjectIconService');
        configurationService = ServiceContainer.getInstance().getClass<IConfigurationService>('IConfigurationService');
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(objectIconService).not.undefined;
    });

    // describe('Create a valid request to retrieve a objectIcon.', () => {

    //     before(() => {
    //         nockScope
    //             .get(resourcePath)
    //             .query({
    //                 filter: createFilter()
    //             })
    //             .reply(200, buildObjectIconResponse(123456));
    //     });

    //     function createFilter(): string {
    //         const filter = {
    //             "ObjectIcon": {
    //                 "AND": [
    //                     { "Field": "Object", "Operator": "EQ", "Value": "ObjectType" },
    //                     { "Field": "ObjectID", "Operator": "EQ", "Value": "ObjectId" }
    //                 ]
    //             }
    //         }
    //         return JSON.stringify(filter);
    //     }

    //     it('should return a objectIcon.', async () => {
    //         const objectIcon: ObjectIcon = await objectIconService.getObjectIcon('', 'ObjectType', 'ObjectId')
    //         expect(objectIcon).not.undefined;
    //         expect(objectIcon.ID).equal(123456);
    //     });
    // });
});

function buildObjectIconResponse(id: number): ObjectIconsResponse {
    const response = new ObjectIconsResponse();
    response.ObjectIcon = [];
    const icon = new ObjectIcon();
    icon.ID = id;
    response.ObjectIcon.push(icon);
    return response;
}
