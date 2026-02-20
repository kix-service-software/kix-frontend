/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import jsonfile from 'jsonfile';
import path from 'path';

import lasso from 'lasso';
import { PluginService } from '../../../../server/services/PluginService';
import { AgentPortalExtensions } from '../extensions/AgentPortalExtensions';
import { LoggingService } from '../../../../server/services/LoggingService';
import { IMarkoApplication } from '../extensions/IMarkoApplication';
import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { ServerUtil } from '../../../../server/ServerUtil';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';

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
    private currentApp: string;
    private configName: string;

    private constructor() {
        this.configName = ServerUtil.isProductionMode()
            ? 'lasso.prod.config.json'
            : 'lasso.dev.config.json';
    }

    public async initializeMarkoApplications(applicationNames?: string[]): Promise<void> {
        let applications = await PluginService.getInstance().getExtensions<IMarkoApplication>(
            AgentPortalExtensions.MARKO_APPLICATION
        );

        const modules = await PluginService.getInstance().getExtensions<IKIXModuleExtension>(
            AgentPortalExtensions.MODULES
        );

        if (applicationNames?.length) {
            applications = applications.filter((a) => applicationNames.some((an) => an === a.applicationName));
        }

        if (applications.length) {
            await this.registerModules(applications, modules);
            await this.buildMarkoApplications(applications);
        } else {
            LoggingService.getInstance().warning(`[MARKO] stop error - no applications to build! (${applicationNames})`);
        }
    }

    private async registerModules(applications: IMarkoApplication[], modules: IKIXModuleExtension[]): Promise<void> {
        for (const moduleExtension of modules) {

            if (moduleExtension.applications?.length) {
                for (const app of moduleExtension.applications) {
                    const application = applications.find((a) => a.applicationName === app);
                    if (application) {
                        await this.registerApplicationModule(application, moduleExtension);
                    }
                }
            } else {
                for (const application of applications) {
                    await this.registerApplicationModule(application, moduleExtension);
                }
            }
        }
    }

    private async registerApplicationModule(
        application: IMarkoApplication, moduleExtension: IKIXModuleExtension
    ): Promise<void> {
        try {
            let folder = 'modules';
            const rootPath = ['..', '..'];

            if (!application.internal) {
                folder = 'plugins';
                rootPath.push('..', '..');
            }

            const browserJsonPath = path.join(
                ...rootPath, folder, application.path, 'browser.json'
            );

            const browserJSON = require(browserJsonPath);
            this.addMouldeDependencies(browserJSON, moduleExtension, application.internal);

            await this.saveBrowserJSON(browserJSON, browserJsonPath);
            this.clearRequireCache(browserJsonPath);
        } catch (e) {
            LoggingService.getInstance().error(
                `Error while registerApplicationModule - application: ${JSON.stringify(application)} moduleExtension: ${JSON.stringify(moduleExtension)}`
            );
            throw e;
        }
    }


    public addMouldeDependencies(
        browserJSON: BrowserJSON, moduleExtension: IKIXModuleExtension, internalApp: boolean
    ): void {
        const folder = moduleExtension.external ? 'plugins' : 'modules';
        const rootPath = ['..', '..', '..', '..'];

        if (internalApp && moduleExtension.external) {
            rootPath.push('..', '..');
        } else if (!internalApp && !moduleExtension.external) {
            rootPath.push('..', 'frontend-applications', 'agent-portal');
        } else if (!internalApp) {
            rootPath.push('..');
        }

        const prePath = path.join(...rootPath, folder);
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
        this.ready = false;

        this.appIsReady();

        const applicationString = ConfigurationService.getEnvString('BUILD_MARKO_APPLICATIONS');
        if (applicationString) {
            const applicationsToBuild = applicationString.split(',');
            applications = applications.filter((a) => applicationsToBuild.some((ab) => ab === a.name));
        }

        LoggingService.getInstance().info(`Build ${applications.length} marko applications`);

        this.appNames = applications.map((a) => a.name);

        for (const application of applications) {
            LoggingService.getInstance().info(`[MARKO] Start - App Build ${application.name}`);

            let folder = 'modules';
            const rootPath = ['..', '..'];

            if (!application.internal) {
                rootPath.push('..', '..');
                folder = 'plugins';
            }

            const templatePath = path.join(__dirname, ...rootPath, folder, application.path);

            const template = require(templatePath).default;
            await this.buildApplication(template, application);
        }

        this.ready = true;
    }

    private async buildApplication(template: any, app: IMarkoApplication): Promise<void> {
        try {
            this.currentApp = app.name;

            const baseRoute = ConfigurationService.getEnvString(app.baseRouteENV) || '';
            this.configureLasso(baseRoute);

            const startBuild = Date.now();
            await template.render({}).catch((error) => {
                LoggingService.getInstance().error(error);
            });
            const endBuild = Date.now();

            const index = this.appNames.findIndex((a) => a === app.name);
            if (index !== -1) {
                this.appNames.splice(index, 1);
            }

            LoggingService.getInstance().info(`[MARKO] Finished - App Build for ${app.name} in ${(endBuild - startBuild) / 1000}s.`);
        } catch (error) {
            LoggingService.getInstance().error(`Error building wep application: ${app}`);
            LoggingService.getInstance().error(error);
        }
    }

    public configureLasso(baseRoute: string): void {
        this.clearRequireCache(this.configName);
        const configPath = path.join(__dirname, '..', this.configName);
        LoggingService.getInstance().info(`[MARKO] use lasso.js config: ${configPath}`);
        const lassoConfig = require(configPath);
        lassoConfig.urlPrefix = `${baseRoute}/static/applications`;
        lasso.configure(lassoConfig);
    }

    public async appIsReady(): Promise<boolean> {
        let tryCount = 1;
        const lassoTimeout = Number(process.env.LASSO_TIMEOUT) || 360000;
        const waitForTime = lassoTimeout / 20;
        while (!this.ready && tryCount <= 20) {
            await this.waitForReadyState(waitForTime, tryCount);
            tryCount++;
        }

        return this.ready;
    }

    private async waitForReadyState(waitForTime: number, tryCount: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                if (!this.ready) {
                    const count = tryCount.toString().padStart(2, '0');
                    const duration = waitForTime * tryCount / 1000;
                    LoggingService.getInstance().info(`[MARKO] (${count} - ${duration}s) In Progress - App Build ${this.currentApp} (pending: ${this.appNames.join(', ')})`);
                }
                resolve();
            }, waitForTime);
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
