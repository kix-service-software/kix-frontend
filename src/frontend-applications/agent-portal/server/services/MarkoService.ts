/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import jsonfile from 'jsonfile';
import path from 'path';

import lasso from 'lasso';
import { ApplicationRouter } from '../routes/ApplicationRouter';
import { PluginService } from '../../../../server/services/PluginService';
import { AgentPortalExtensions } from '../extensions/AgentPortalExtensions';
import { LoggingService } from '../../../../server/services/LoggingService';
import { ProfilingService } from '../../../../server/services/ProfilingService';

import { IMarkoApplication } from '../extensions/IMarkoApplication';
import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { ServerUtil } from '../../../../server/ServerUtil';

export class MarkoService {

    private static INSTANCE: MarkoService;

    public static getInstance(): MarkoService {
        if (!MarkoService.INSTANCE) {
            MarkoService.INSTANCE = new MarkoService();
        }
        return MarkoService.INSTANCE;
    }

    private ready: boolean = false;
    private appNames: string[] = [];

    private constructor() {
        let configName = 'lasso.dev.config.json';
        if (ServerUtil.isProductionMode()) {
            configName = 'lasso.prod.config.json';
        }
        this.clearRequireCache(configName);
        const lassoConfig = require(path.join(__dirname, '..', configName));
        lasso.configure(lassoConfig);
    }

    public async initializeMarkoApplications(): Promise<void> {
        ApplicationRouter.getInstance().setUpdate(true);

        const applications = await PluginService.getInstance().getExtensions<IMarkoApplication>(
            AgentPortalExtensions.MARKO_APPLICATION
        );

        const modules = await PluginService.getInstance().getExtensions<IKIXModuleExtension>(
            AgentPortalExtensions.MODULES
        );

        await this.registerModules(applications, modules);

        await this.buildMarkoApplications(applications);
        ApplicationRouter.getInstance().setUpdate(false);
    }

    private async registerModules(applications: IMarkoApplication[], modules: IKIXModuleExtension[]): Promise<void> {
        for (const moduleExtension of modules) {
            for (const app of moduleExtension.applications) {

                const application = applications.find((a) => a.name === app);

                if (application) {
                    const folder = application.internal ? 'modules' : path.join('..', '..', 'plugins');
                    const browserJsonPath = path.join(
                        '..', '..', folder, application.name, application.path, 'browser.json'
                    );

                    const browserJSON = require(browserJsonPath);
                    this.addMouldeDependencies(browserJSON, moduleExtension);

                    await this.saveBrowserJSON(browserJSON, browserJsonPath);
                    this.clearRequireCache(browserJsonPath);
                }
            }
        }
    }

    public addMouldeDependencies(browserJSON: BrowserJSON, moduleExtension: IKIXModuleExtension): void {
        const folder = moduleExtension.external ? path.join('..', '..', 'plugins') : 'modules';
        const prePath = path.join('..', '..', '..', '..', folder);
        moduleExtension.webDependencies.forEach((d) => {
            const dependency = path.join(prePath, d);
            const exists = browserJSON.dependencies.find((dep) => dep === dependency);
            if (!exists) {
                browserJSON.dependencies.push(dependency);
            }
        });
    }

    private async saveBrowserJSON(browserJSON: BrowserJSON, destination: string): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            jsonfile.writeFile(path.join(__dirname, destination), browserJSON,
                (fileError: Error) => {
                    if (fileError) {
                        LoggingService.getInstance().error(fileError.message);
                        reject(fileError);
                    }

                    resolve();
                });
        });
    }

    private async buildMarkoApplications(applications: IMarkoApplication[]): Promise<void> {
        const profileTaskId = ProfilingService.getInstance().start('MarkoService', 'Build App');

        this.ready = false;

        this.appIsReady();
        lasso.clearCaches();

        LoggingService.getInstance().info(`Build ${applications.length} marko applications`);

        const buildPromises = [];
        this.appNames = applications.map((a) => a.name);
        for (const app of applications) {
            LoggingService.getInstance().info(`[MARKO] Start - App Build ${app.name}`);

            const folder = app.internal ? 'modules' : 'plugins';
            const templatePath = path.join(__dirname, '..', '..', folder, app.name, app.path);
            const template = require(templatePath).default;
            buildPromises.push(this.buildApplication(template, app));
        }

        await Promise.all(buildPromises);

        this.ready = true;
        ProfilingService.getInstance().stop(profileTaskId);
    }

    private async buildApplication(template: any, app: IMarkoApplication): Promise<void> {
        const profileTaskId = ProfilingService.getInstance().start('MarkoService', `Build App ${app.name}`);

        const startBuild = Date.now();
        await template.render({}).catch((error) => {
            ProfilingService.getInstance().stop(profileTaskId, { data: [`[MARKO] ERROR - App Build for ${app.name}`] });
            LoggingService.getInstance().error(error);
        });
        const endBuild = Date.now();

        const index = this.appNames.findIndex((a) => a === app.name);
        if (index !== -1) {
            this.appNames.splice(index, 1);
        }

        LoggingService.getInstance().info(`[MARKO] Finished - App Build for ${app.name} in ${(endBuild - startBuild) / 1000}s.`);
        ProfilingService.getInstance().stop(profileTaskId);
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
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                if (!this.ready) {
                    LoggingService.getInstance().info(`[MARKO] In Progress - App Build ${this.appNames.join(', ')}`);
                }
                resolve();
            }, 6000);
        });
    }

    private clearRequireCache(configPath: string): void {
        try {
            const config = require.resolve(configPath);
            if (require.cache[config]) {
                delete require.cache[config];
            }
        } catch (error) {
            return;
        }
    }

}

interface BrowserJSON {
    dependencies: Array<string>;
}
