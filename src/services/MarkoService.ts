import { inject, injectable } from 'inversify';
import { IMarkoService, IPluginService, ILoggingService, IProfilingService } from '@kix/core/dist/services';
import { IMarkoDependencyExtension, KIXExtensions } from '@kix/core/dist/extensions';
import { Response } from 'express';
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
        const markoDependencies: IMarkoDependencyExtension[] =
            await this.pluginService.getExtensions<IMarkoDependencyExtension>(KIXExtensions.MARKO_DEPENDENCIES);
        const browserJSON = require(this.browserJsonPath);

        this.fillDependencies(browserJSON, markoDependencies);
        await this.saveBrowserJSON(browserJSON);
        await this.buildMarkoApp();
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
