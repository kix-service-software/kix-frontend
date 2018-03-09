/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    DynamicFieldResponse,
    DynamicFieldsResponse,
    CreateDynamicField,
    CreateDynamicFieldRequest,
    CreateDynamicFieldResponse,
    UpdateDynamicField,
    UpdateDynamicFieldRequest,
    UpdateDynamicFieldResponse
} from '@kix/core/dist/api';

import { DynamicField, SortOrder } from '@kix/core/dist/model/';
import { IDynamicFieldService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/dynamicfields";

describe('DynamicField Service', () => {
    let nockScope;
    let dynamicFieldService: IDynamicFieldService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        dynamicFieldService = container.getDIContainer().get<IDynamicFieldService>("IDynamicFieldService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(dynamicFieldService).not.undefined;
    });

});