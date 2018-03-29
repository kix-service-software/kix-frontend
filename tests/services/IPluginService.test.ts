// tslint:disable
import { IPluginService } from '@kix/core/dist/services';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { ServiceContainer } from '@kix/core/dist/common';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Plugin Service Service', () => {
    let pluginService: IPluginService;

    before(async () => {
        require('../TestSetup');
        pluginService = ServiceContainer.getInstance().getClass<IPluginService>("IPluginService");
    });

    describe('Register and load a Extension', () => {
        it('Should register a plugin in the plugin manager.', async () => {
            pluginService.pluginManager.register('test:extension', 'MyPlugin', (data, host, options) => {
                return {
                    id: "MyPlugin"
                };
            });

            const extensions = await pluginService.getExtensions<any>('test:extension');

            expect(extensions).not.empty;
            expect(extensions[0].id).equal("MyPlugin");
        });
    });
});
