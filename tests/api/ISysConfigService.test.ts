/* tslint:disable*/
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { ConfigurationService, SysConfigService } from '../../src/core/services';
import { SysConfigItem, KIXObjectType } from '../../src/core/model';
import { SysConfigItemsResponse } from '../../src/core/api';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = '/sysconfig';

describe('SysConfigIteme Service', () => {
    let nockScope;
    let apiURL: string;

    before(async () => {
        require('../TestSetup');
        const nock = require('nock');
        apiURL = ConfigurationService.getInstance().getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('Service instance is registered in container.', () => {
        expect(SysConfigService.getInstance()).exist;
    });

    describe('Create a valid request to retrieve a sysConfigItem.', () => {

        const sysConfigKey = '123456';

        before(() => {
            nockScope
                .get(resourcePath + '/' + sysConfigKey)
                .reply(200, buildSysConfigItemsResponse(sysConfigKey));
        });

        it('Should return a sysConfigItem.', async () => {
            const sysConfigItems = await SysConfigService.getInstance().loadObjects<SysConfigItem>('token', KIXObjectType.SYS_CONFIG_ITEM, [sysConfigKey], null, null);
            expect(sysConfigItems).exist;
            expect(sysConfigItems).an('array');
            expect(sysConfigItems.length).equals(1);
            expect(sysConfigItems[0].ID).equal(sysConfigKey);
        });
    });

});

function buildSysConfigItemsResponse(id: string): SysConfigItemsResponse {
    const response = new SysConfigItemsResponse();
    const item = new SysConfigItem();
    item.ID = id;
    response.SysConfigItem = [item];
    return response;
}
