import { KIXExtensions, IKIXModuleExtension } from '../core/extensions';
import jsonfile = require('jsonfile');
import { BaseTemplateInput } from '../core/common';
import { ObjectData } from '../core/model';
import { PluginService } from './PluginService';
import { ProfilingService, LoggingService } from '../core/services';

export class MarkoService {

    private static INSTANCE: MarkoService;

    public static getInstance(): MarkoService {
        if (!MarkoService.INSTANCE) {
            MarkoService.INSTANCE = new MarkoService();
        }
        return MarkoService.INSTANCE;
    }

    private browserJsonPath: string = '../components/_app/browser.json';

    private ready: boolean = false;

    private constructor() { }

    public initCache(): Promise<void> {
        return;
    }

    public async registerMarkoDependencies(): Promise<void> {
        const modules: IKIXModuleExtension[] = await PluginService.getInstance().getExtensions<IKIXModuleExtension>(
            KIXExtensions.MODULES
        );

        const browserJSON = require(this.browserJsonPath);

        this.fillDependencies(browserJSON, modules);
        await this.saveBrowserJSON(browserJSON);
        await this.buildMarkoApp();
    }

    private fillDependencies(browserJSON: any, modules: IKIXModuleExtension[]): void {
        for (const kixModule of modules) {
            let prePath = 'require ../';
            if (kixModule.external) {
                prePath = 'require: ../../../node_modules/';
            }

            for (const dependencyPath of kixModule.tags) {
                const dependency = prePath + dependencyPath[1];
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
                        LoggingService.getInstance().error(fileError.message);
                        reject(fileError);
                    }

                    resolve();
                });
        });
    }

    private async buildMarkoApp(): Promise<void> {
        const profileTaskId = ProfilingService.getInstance().start(
            'MarkoService', 'Build App'
        );

        this.appIsReady();

        const loginTemplate = require('../components/_login-app');
        await new Promise<void>((resolve, reject) => {
            loginTemplate.render(
                {
                    themeCSS: [],
                    specificCSS: [],
                    data: new BaseTemplateInput('home', new ObjectData(), null)
                }, (error, result) => {
                    if (error) {
                        ProfilingService.getInstance().stop(profileTaskId, 'Login build error.');
                        LoggingService.getInstance().error(error);
                        reject(error);
                    } else {
                        LoggingService.getInstance().info("Login app build finished.");
                        resolve();
                    }
                });
        });

        const appTemplate = require('../components/_app');
        await new Promise<void>((resolve, reject) => {
            appTemplate.render(
                {
                    themeCSS: [],
                    specificCSS: [],
                    data: new BaseTemplateInput('home', new ObjectData(), null)
                }, (error, result) => {
                    if (error) {
                        ProfilingService.getInstance().stop(profileTaskId, 'App build error.');
                        LoggingService.getInstance().error(error);
                        reject(error);
                    } else {
                        ProfilingService.getInstance().stop(profileTaskId, 'App build finished.');
                        this.ready = true;
                        resolve();
                    }
                });
        });
    }

    public async appIsReady(): Promise<boolean> {
        let tryCount = 20;
        while (!this.ready && tryCount > 0) {
            await this.waitForReadyState();
            tryCount -= 1;
        }

        return this.ready;
    }

    private async waitForReadyState(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                LoggingService.getInstance().info('App build in progress ...');
                resolve();
            }, 6000);
        });
    }

}
