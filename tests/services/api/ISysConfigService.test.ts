/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    SysConfigItemResponse
} from '@kix/core/dist/api';

import { SysConfigItem, SortOrder } from '@kix/core/dist/model';
import { ISysConfigService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = '/sysconfig';

describe('SysConfigIteme Service', () => {
    let nockScope;
    let sysConfigService: ISysConfigService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        sysConfigService = container.getDIContainer().get<ISysConfigService>('ISysConfigService');
        configurationService = container.getDIContainer().get<IConfigurationService>('IConfigurationService');
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(sysConfigService).not.undefined;
    });

    describe('Create a valid request to retrieve a sysConfigItem.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildSysConfigItemeResponse('12345'));
        });

        it('should return a sysConfigItem.', async () => {
            const sysConfigItem: SysConfigItem = await sysConfigService.getSysConfigItem('', '12345')
            expect(sysConfigItem).not.undefined;
            expect(sysConfigItem.ID).equal('12345');
        });
    });

});

function buildSysConfigItemeResponse(id: string): SysConfigItemResponse {
    const response = new SysConfigItemResponse();
    response.SysConfigItem = new SysConfigItem();
    response.SysConfigItem.ID = id;
    return response;
}
