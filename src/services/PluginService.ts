import { IPluginService } from './IPluginService';
import { IServerConfiguration } from './../model/configuration/IServerConfiguration';
import jsonfile = require('jsonfile');
import Plugins = require('js-plugins');
const host = {
    debug: true
};

export class PluginService implements IPluginService {

    private pluginManager: any;

    public constructor() {
        const serverConfiguration: IServerConfiguration = require('../../server.config.json');
        this.pluginManager = new Plugins();

        const pluginDirs = [];
        for (const dir of serverConfiguration.PLUGIN_FOLDERS) {
            pluginDirs.push(__dirname + '/../../' + dir);
        }
        this.pluginManager.scanSubdirs(pluginDirs);
        this.pluginManager.scan();
    }

    public loadPlugins(): Promise<any> {
        const promises: Array<Promise<any>> = [];
        promises.push(this.loadRegisteredMarkoDependencies());
        return Promise.all(promises);
    }

    /**
     * Retrieves all registered markeo dependency extension and
     * provides the dependencies to the browser.json of the app component.
     * This is needed that the lasso framework is able to build the static
     * folder with the marko content from the external plugins.
     */
    private loadRegisteredMarkoDependencies(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const config = { multi: true };
            // TODO: Interface for marko dependency extension needed!
            // TODO: Constants for extension IDs
            this.pluginManager.connect(host, "kix:markodependencies", config,
                (err, markoDependencies, names) => {
                    if (err) {
                        reject(err);
                    }

                    const browserJsonPath = '../components/app/browser.json';
                    const browserJSON = require(browserJsonPath);
                    browserJSON.dependencies = [];

                    for (const plugin of markoDependencies) {
                        for (const path of plugin.getDependencies()) {
                            const dependency = 'require: ../../../node_modules/' + path;
                            const exists = browserJSON.dependencies.find((d) => d === dependency);
                            if (!exists) {
                                browserJSON.dependencies.push(dependency);
                            }
                        }
                    }

                    jsonfile.writeFile(__dirname + "/" + browserJsonPath, browserJSON,
                        (fileError) => {
                            if (fileError) {
                                console.error(fileError);
                            }
                        });

                    resolve();
                });
        });
    }
}
