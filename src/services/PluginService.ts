import { IPluginService, IConfigurationService } from './';
import { injectable, inject } from 'inversify';
import { IServerConfiguration } from './../model/configuration/IServerConfiguration';
import Plugins = require('js-plugins');
const host = {
    debug: true
};

@injectable()
export class PluginService implements IPluginService {

    private pluginManager: any;

    public constructor( @inject("IConfigurationService") configurationService: IConfigurationService) {
        const serverConfiguration: IServerConfiguration = configurationService.getServerConfiguration();
        this.pluginManager = new Plugins();

        const pluginDirs = [];
        const fs = require('fs');
        for (const dir of serverConfiguration.PLUGIN_FOLDERS) {
            const path = __dirname + '/../../' + dir;
            pluginDirs.push(path);
        }

        if (fs.existsSync(__dirname + '/../../extensions/dashboard/package.json')) {
            console.log("Exists: " + __dirname + '/../../extensions/dashboard/package.json');
        } else {
            console.log("Not Exists: " + __dirname + '/../../extensions/dashboard/package.json');
        }

        if (fs.existsSync(__dirname + '/../../extensions/application/package.json')) {
            console.log("Exists: " + __dirname + '/../../extensions/application/package.json');
        } else {
            console.log("Not Exists: " + __dirname + '/../../extensions/application/package.json');
        }


        this.pluginManager.scanSubdirs(pluginDirs);
        this.pluginManager.scan();
    }

    public async getExtensions<T>(extensionId: string): Promise<T[]> {
        return await new Promise<T[]>((resolve, reject) => {
            const config = { multi: true };
            this.pluginManager.connect(host, extensionId, config,
                (err, extensions: T[], names) => {
                    console.log("Extensions for " + extensionId + ": ");
                    console.log(names);

                    if (err) {
                        reject(err);
                    }
                    resolve(extensions);
                });
        });
    }
}
