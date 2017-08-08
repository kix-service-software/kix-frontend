import { IPluginService } from './IPluginService';
import { IServerConfiguration } from './../model/configuration/IServerConfiguration';
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

    public getExtensions<T>(extensionId: string): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const config = { multi: true };
            this.pluginManager.connect(host, extensionId, config,
                (err, extensions: T[], names) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(extensions);
                });
        });
    }
}
