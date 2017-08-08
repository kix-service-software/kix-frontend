import { IMarkoDependency, KIXExtensions } from '../extensions/';
import { IMarkoService } from './IMarkoService';
import { IPluginService } from './IPluginService';
import { PluginService } from './PluginService';
import jsonfile = require('jsonfile');

export class MarkoService implements IMarkoService {

    private pluginService: IPluginService;

    public constructor(pluginService: IPluginService) {
        this.pluginService = pluginService;
    }

    public async registerMarkoDependencies(): Promise<void> {
        const markoDependencies: IMarkoDependency[] =
            await this.pluginService.getExtensions<IMarkoDependency>(KIXExtensions.MARKO_DEPENDENCIES);

        const browserJsonPath = '../components/app/browser.json';
        const browserJSON = require(browserJsonPath);
        browserJSON.dependencies = [];

        for (const plugin of markoDependencies) {
            for (const dependencyPath of plugin.getDependencies()) {
                const dependency = 'require: ../../../node_modules/' + dependencyPath;
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
    }
}
