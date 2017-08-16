import { IMarkoDependencyExtension, KIXExtensions } from '../extensions/';
import { IMarkoService } from './IMarkoService';
import { inject, injectable } from 'inversify';
import { IPluginService } from './IPluginService';
import { PluginService } from './PluginService';
import jsonfile = require('jsonfile');

@injectable()
export class MarkoService implements IMarkoService {

    private browserJsonPath: string = '../components/app/browser.json';
    private pluginService: IPluginService;

    public constructor( @inject("IPluginService") pluginService: IPluginService) {
        this.pluginService = pluginService;
        this.registerMarkoDependencies();
    }

    public async registerMarkoDependencies(): Promise<void> {
        const markoDependencies: IMarkoDependencyExtension[] =
            await this.pluginService.getExtensions<IMarkoDependencyExtension>(KIXExtensions.MARKO_DEPENDENCIES);

        const browserJSON = require(this.browserJsonPath);

        this.fillDependencies(browserJSON, markoDependencies);
        await this.saveBrowserJSON(browserJSON);
    }

    private fillDependencies(browserJSON: any, markoDependencies: IMarkoDependencyExtension[]): void {
        for (const plugin of markoDependencies) {
            for (const dependencyPath of plugin.getDependencies()) {
                const dependency = 'require: ../../../node_modules/' + dependencyPath;
                const exists = browserJSON.dependencies.find((d) => d === dependency);
                if (!exists) {
                    browserJSON.dependencies.push(dependency);
                }
            }
        }
    }

    private async saveBrowserJSON(browserJSON: any): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            jsonfile.writeFile(__dirname + "/" + this.browserJsonPath, browserJSON,
                (fileError) => {
                    if (fileError) {
                        // TODO: Use LogginService
                        // TODO: Throw an exception
                        console.error(fileError);
                        reject(fileError);
                    }

                    resolve();
                });
        });
    }
}
