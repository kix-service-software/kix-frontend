/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import Plugins from 'js-plugins';
import { LoggingService } from './LoggingService';

import fs from 'fs';
import path from 'path';
import { ReleaseInfoUtil } from '../ReleaseInfoUtil';
import { ReleaseInfo } from '../../frontend-applications/agent-portal/model/ReleaseInfo';

const host = { debug: true };

export class PluginService {

    private static INSTANCE: PluginService;

    private extensionFolder: string[] = [];

    public availablePlugins: Array<[string, ReleaseInfo]> = [];

    public static getInstance(): PluginService {
        if (!PluginService.INSTANCE) {
            PluginService.INSTANCE = new PluginService();
        }
        return PluginService.INSTANCE;
    }

    public pluginManager: any;

    private constructor() { }

    public async init(extensionFolder: string[]): Promise<void> {
        this.pluginManager = new Plugins();
        this.extensionFolder = extensionFolder.map((ef) => path.join(__dirname, '/../', ef));

        const plugins = await this.initPlugins();

        this.extensionFolder = [
            ...this.extensionFolder,
            ...plugins
        ];

        this.scanPlugins();
    }

    private async initPlugins(): Promise<string[]> {
        const pluginPaths = [];

        const pluginsFolder = path.join(__dirname, '..', '..', 'plugins');
        let plugins = [];
        try {
            plugins = fs.readdirSync(pluginsFolder);
        } catch (error) {
            LoggingService.getInstance().warning('Could not read plugin folder.', error);
        }

        const availablePlugins: Array<[string, string, ReleaseInfo]> = [];

        for (const plugin of plugins) {
            const pluginFolder = path.join(pluginsFolder, plugin);
            const pluginStats = fs.lstatSync(pluginFolder);
            if (pluginStats.isDirectory()) {
                const pluginContent = fs.readdirSync(pluginFolder);
                let foundReleaseFile = false;

                for (const pluginFile of pluginContent) {
                    if (pluginFile === 'RELEASE') {
                        foundReleaseFile = true;
                        const releaseFile = path.join(pluginFolder, pluginFile);
                        const releaseInfo = await ReleaseInfoUtil.getInstance().getReleaseInfo(releaseFile);
                        availablePlugins.push([plugin, pluginFolder, releaseInfo]);
                    }
                }

                if (!foundReleaseFile) {
                    LoggingService.getInstance().warning(`Skip plugin ${plugin}. No RELEASE file found.`);
                }
            }
        }

        for (const plugin of availablePlugins) {
            const match = await this.hasValidDependencies(plugin[2], plugin[0], availablePlugins);
            if (match) {
                this.availablePlugins.push([plugin[0], plugin[2]]);
                pluginPaths.push(plugin[1]);
            }
        }

        return pluginPaths;
    }

    private async hasValidDependencies(
        releaseInfo: ReleaseInfo, plugin: string, availablePlugins: Array<[string, string, ReleaseInfo]>
    ): Promise<boolean> {
        let success = true;
        if (releaseInfo.dependencies) {
            for (const requirement of releaseInfo.dependencies) {
                let currentVersion: number;
                let missing = false;
                if (requirement[0] === 'framework') {
                    const frameworkInfo = await ReleaseInfoUtil.getInstance().getReleaseInfo();
                    currentVersion = frameworkInfo.buildNumber;
                } else if (requirement[0].indexOf('::') === -1) {
                    const availablePlugin = availablePlugins.find((p) => p[0] === requirement[0]);
                    if (availablePlugin) {
                        currentVersion = availablePlugin[2].buildNumber;
                    } else {
                        missing = true;
                    }
                } else {
                    continue;
                }

                if (missing) {
                    LoggingService.getInstance().warning(
                        // tslint:disable-next-line:max-line-length
                        `Could not resolve dependency for ${plugin}: ${requirement[0]} not found!`
                    );
                    success = false;
                } else if (!this.checkVersion(Number(requirement[2]), requirement[1], currentVersion)) {
                    LoggingService.getInstance().warning(
                        // tslint:disable-next-line:max-line-length
                        `Could not resolve dependency for ${plugin}: [${requirement[0]}] ${currentVersion} ${requirement[1]} ${requirement[2]}`
                    );
                    success = false;
                }
            }
        }

        return success;
    }

    private checkVersion(requiredVersion: number, operator: string, currentVersion: number): boolean {
        let match = false;
        if (!requiredVersion && !operator) {
            match = true;
        } else if (!currentVersion) {
            match = false;
        } else {
            switch (operator) {
                case '>':
                    match = currentVersion > requiredVersion;
                    break;
                case '<':
                    match = currentVersion < requiredVersion;
                    break;
                case '!':
                    match = requiredVersion !== currentVersion;
                    break;
                default:
                    match = requiredVersion === currentVersion;
            }
        }

        return match;
    }

    public scanPlugins(): void {
        this.pluginManager.scanSubdirs(this.extensionFolder);
        this.pluginManager.scan();
    }

    public getExtensions<T>(extensionId: string): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const config = { multi: true };
            this.pluginManager.connect(host, extensionId, config,
                (error, extensions: T[], names) => {
                    if (error) {
                        LoggingService.getInstance().error('Error during http GET request.', error);
                        reject(error);
                    }

                    extensions = extensions.filter((e) => {
                        if ((e as any).pluginId) {
                            if ((e as any).pluginId.toLowerCase() === 'kixstart') {
                                return true;
                            } else {
                                return this.availablePlugins.some(
                                    (p) => p[0].toLowerCase() === (e as any).pluginId.toLowerCase()
                                );
                            }
                        }
                        LoggingService.getInstance().error(`Extension ${e.constructor.name} has no plugin id.`);
                        return false;
                    });

                    resolve(extensions);
                });
        });
    }

}
