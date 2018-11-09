import { inject, injectable } from 'inversify';
import { IMarkoService, IPluginService, ILoggingService, IProfilingService } from '@kix/core/dist/services';
import { KIXExtensions, IKIXModuleExtension } from '@kix/core/dist/extensions';
import jsonfile = require('jsonfile');
import { BaseTemplateInput } from '@kix/core/dist/common';
import { ObjectData } from '@kix/core/dist/model';

@injectable()
export class MarkoService implements IMarkoService {

    private browserJsonPath: string = '../components/_app/browser.json';

    private ready: boolean = false;

    public constructor(
        @inject("IPluginService") private pluginService: IPluginService,
        @inject("ILoggingService") private loggingService: ILoggingService,
        @inject("IProfilingService") protected profilingService: IProfilingService,
    ) {
        this.registerMarkoDependencies();
    }

    public initCache(): Promise<void> {
        return;
    }

    public async registerMarkoDependencies(): Promise<void> {
        const markoDependencies: IKIXModuleExtension[] = await this.pluginService.getExtensions<IKIXModuleExtension>(
            KIXExtensions.MODULES
        );

        const browserJSON = require(this.browserJsonPath);

        this.fillDependencies(browserJSON, markoDependencies);
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
                        this.loggingService.error(fileError.message);
                        reject(fileError);
                    }

                    resolve();
                });
        });
    }

    private async buildMarkoApp(): Promise<void> {
        const profileTaskId = this.profilingService.start(
            'MarkoService', 'Build App'
        );

        const loginTemplate = require('../components/_login-app');
        await new Promise<void>((resolve, reject) => {
            loginTemplate.render(
                {
                    themeCSS: [],
                    specificCSS: [],
                    data: new BaseTemplateInput('home', new ObjectData(), null)
                }, (error, result) => {
                    if (error) {
                        this.profilingService.stop(profileTaskId, 'Login build error.');
                        this.loggingService.error(error);
                        reject(error);
                    } else {
                        this.loggingService.info("Login app build finished.");
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
                        this.profilingService.stop(profileTaskId, 'App build error.');
                        this.loggingService.error(error);
                        reject(error);
                    } else {
                        this.profilingService.stop(profileTaskId, 'App build finished.');
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

        return true;
    }

    private async waitForReadyState(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                this.loggingService.info('App build in progress ...');
                resolve();
            }, 6000);
        });
    }

}
