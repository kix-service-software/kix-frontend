// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { PluginService } from '../src/services';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Plugin Service Service', () => {

    before(async () => {
        require('./TestSetup');
    });

    describe('Register and load a Extension.', () => {
        it('Should register a plugin in the plugin manager.', async () => {
            PluginService.getInstance().pluginManager.register('test:extension', 'MyPlugin', (data, host, options) => {
                return {
                    id: "MyPlugin"
                };
            });

            const extensions = await PluginService.getInstance().getExtensions<any>('test:extension');

            expect(extensions).not.empty;
            expect(extensions[0].id).equal("MyPlugin");
        });
    });
});
