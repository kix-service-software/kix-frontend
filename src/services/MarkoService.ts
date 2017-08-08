import { IMarkoService } from './IMarkoService';
import { KIXExtensions, IMarkoDependency } from '../extensions/';
import { IPluginService } from './IPluginService';
import { PluginService } from './PluginService';
import jsonfile = require('jsonfile');

export class MarkoService implements IMarkoService {

    private pluginService: IPluginService;

    public constructor(pluginService: IPluginService) {
        this.pluginService = pluginService;
    }

    public registerMarkoDependencies(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.pluginService.getExtensions<IMarkoDependency>(KIXExtensions.MARKO_DEPENDENCIES)
                .then((markoDependencies: IMarkoDependency[]) => {
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
                    resolve();
                });
        });
    }
}
