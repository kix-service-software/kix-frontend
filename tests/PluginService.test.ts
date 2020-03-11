/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { PluginService } from '../src/server/services/PluginService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Plugin Service Service', () => {

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
