/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    ObjectIconResponse
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

import { ObjectIcon } from '@kix/core/dist/model';
import { IObjectIconService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = '/objecticons';

describe('ObjectIcon Service', () => {
    let nockScope;
    let objectIconService: IObjectIconService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        objectIconService = container.getDIContainer().get<IObjectIconService>('IObjectIconService');
        configurationService = container.getDIContainer().get<IConfigurationService>('IConfigurationService');
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(objectIconService).not.undefined;
    });

    describe('Create a valid request to retrieve a objectIcon.', () => {

        before(() => {
            nockScope
                .get(resourcePath)
                .query({
                    filter: {
                        "ObjectIcon": {
                            "AND": [
                                {
                                    "Field": "Object",
                                    "Operator": "EQ",
                                    "Value": "ObjectType"
                                },
                                {
                                    "Field": "ObjectID",
                                    "Operator": "EQ",
                                    "Value": "ObjectId"
                                }
                            ]
                        }
                    }
                })
                .reply(200, buildObjectIconeResponse(123456));
        });

        it('should return a objectIcon.', async () => {
            const objectIcon: ObjectIcon = await objectIconService.getObjectIcon('', 'ObjectType', 'ObjectId')
            expect(objectIcon).not.undefined;
            expect(objectIcon.ID).equal(123456);
        });
    });

    describe('Create a valid request to retrieve a list of objectIcons.', () => {

        before(() => {
            nockScope
                .get(resourcePath)
                .reply(200, { ObjectIcon: [] });
        });

        it('should return a list of objectIcons.', async () => {
            const objectIcon: ObjectIcon[] = await objectIconService.getObjectIcons('')
            expect(objectIcon).not.undefined;
            expect(objectIcon).an('array');
        });

    });

});

function buildObjectIconeResponse(id: number): ObjectIconResponse {
    const response = new ObjectIconResponse();
    response.ObjectIcon = new ObjectIcon();
    response.ObjectIcon.ID = id;
    return response;
}
