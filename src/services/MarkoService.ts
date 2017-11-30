import { inject, injectable } from 'inversify';
import { IMarkoService, IPluginService, ILoggingService } from '@kix/core/dist/services';
import { IMarkoDependencyExtension, KIXExtensions } from '@kix/core/dist/extensions';
import jsonfile = require('jsonfile');

@injectable()
export class MarkoService implements IMarkoService {

    private browserJsonPath: string = '../components/app/browser.json';
    private pluginService: IPluginService;
    private loggingService: ILoggingService;

    public constructor(
        @inject("IPluginService") pluginService: IPluginService,
        @inject("ILoggingService") loggingService: ILoggingService
    ) {
        this.pluginService = pluginService;
        this.loggingService = loggingService;
        this.registerMarkoDependencies();
    }

    public async registerMarkoDependencies(): Promise<void> {
        const markoDependencies: IMarkoDependencyExtension[] =
            await this.pluginService.getExtensions<IMarkoDependencyExtension>(KIXExtensions.MARKO_DEPENDENCIES);
        const browserJSON = require(this.browserJsonPath);

        this.fillDependencies(browserJSON, markoDependencies);
        await this.saveBrowserJSON(browserJSON);
    }

    public async getComponentTags(): Promise<Array<[string, string]>> {
        const markoDependencies: IMarkoDependencyExtension[] =
            await this.pluginService.getExtensions<IMarkoDependencyExtension>(KIXExtensions.MARKO_DEPENDENCIES);

        const packageJson = require('../../package.json');
        const version = packageJson.version;
        const prePath = '/@kix/frontend$' + version + '/dist/components/';

        const tags: Array<[string, string]> = [];

        for (const plugin of markoDependencies) {
            for (const tag of plugin.getComponentTags()) {
                tag[1] = prePath + tag[1];
                tags.push(tag);
            }
        }

        return tags;
    }

    private fillDependencies(browserJSON: any, markoDependencies: IMarkoDependencyExtension[]): void {
        for (const plugin of markoDependencies) {
            let prePath = 'require ../';
            if (plugin.isExternal()) {
                prePath = 'require: ../../../node_modules/';
            }

            for (const dependencyPath of plugin.getDependencies()) {
                const dependency = prePath + dependencyPath;
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
                (fileError: Error) => {
                    if (fileError) {
                        this.loggingService.error(fileError.message);
                        reject(fileError);
                    }

                    resolve();
                });
        });
    }
}
