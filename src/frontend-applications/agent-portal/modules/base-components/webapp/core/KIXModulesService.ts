/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from '../../../../model/configuration/ConfigurationType';
import { DisplayValueConfiguration } from '../../../../model/configuration/DisplayValueConfiguration';
import { IKIXModuleExtension } from '../../../../model/IKIXModuleExtension';
import { IUIModule } from '../../../../model/IUIModule';
import { ReleaseInfo } from '../../../../model/ReleaseInfo';
import { KIXModulesSocketClient } from './KIXModulesSocketClient';

export class KIXModulesService {

    private static INSTANCE: KIXModulesService;

    public static getInstance(): KIXModulesService {
        if (!KIXModulesService.INSTANCE) {
            KIXModulesService.INSTANCE = new KIXModulesService();
        }
        return KIXModulesService.INSTANCE;
    }

    private constructor() { }

    private modules: IKIXModuleExtension[] = [];

    private tags: Map<string, string>;

    private configurationComponents: Map<ConfigurationType | string, string> = new Map();

    public static application = 'agent-portal';

    public static displayValueConfigurationKey = DisplayValueConfiguration.CONFIGURATION_ID;

    public static urlPrefix = '';

    private releaseInfo: ReleaseInfo;

    private uiModules: IUIModule[] = [];

    public async init(modules: IKIXModuleExtension[]): Promise<void> {
        this.tags = new Map();
        this.modules = modules;
        this.modules.forEach((m) => {
            m.uiComponents.forEach((c) => this.tags.set(c.tagId, c.componentPath));
        });

        this.loadModules();
        await this.registerModules();
        await this.registerModuleExtensions();
    }

    private loadModules(): void {
        const modules = KIXModulesService.getInstance().getModules();
        const requireStart = Date.now();
        for (const mod of modules) {
            for (const c of mod.initComponents) {
                try {
                    const component = require(c.componentPath);
                    if (component && component.UIModule) {
                        this.uiModules.push(new component.UIModule());
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
        const requireEnd = Date.now();
        console.debug(`Require ${modules.length} modules in ${requireEnd - requireStart}ms`);
    }

    private async registerModules(): Promise<void> {
        const moduleStart = Date.now();
        this.uiModules.sort((a, b) => a.priority - b.priority);
        for (let i = 0; i < this.uiModules.length; i++) {
            if (this.uiModules[i].register) {
                const start = Date.now();
                await this.uiModules[i].register();
                const end = Date.now();
                console.debug(`register module: ${this.uiModules[i].priority} - ${this.uiModules[i].name} - ${end - start}ms`);
            } else {
                console.warn(`module with prioritiy ${this.uiModules[i].priority} did not implement register() method.`);
            }
            const percent = Math.round((i / this.uiModules.length) * 100);
        }
        const moduleEnd = Date.now();
        console.debug(`Init modules in ${moduleEnd - moduleStart}ms`);
    }

    private async registerModuleExtensions(): Promise<void> {
        const moduleStart = Date.now();
        this.uiModules.sort((a, b) => a.priority - b.priority);
        for (const uiModule of this.uiModules) {
            if (uiModule.registerExtensions) {
                const start = Date.now();
                await uiModule.registerExtensions();
                const end = Date.now();
                console.debug(`register module extensions: ${uiModule.priority} - ${uiModule.name} - ${end - start}ms`);
            } else {
                console.warn(`module with prioritiy ${uiModule.priority} did not implement registerExtensions() method.`);
            }
        }
        const moduleEnd = Date.now();
        console.debug(`Register Module Extensions modules in ${moduleEnd - moduleStart}ms`);
    }

    public getModules(): IKIXModuleExtension[] {
        return this.modules;
    }

    public static getComponentTemplate(componentId: string): any {
        const component = this.getInstance().tags.get(componentId);
        let template;
        try {
            template = component ? require(component) : undefined;
            if (!template) {
                console.warn(`No template found for component: ${componentId}`);
            }
        } catch (e) {
            console.warn(`No template found for component: ${componentId}`);
            console.error(e);
        }
        return template;
    }

    public registerConfigurationComponent(type: ConfigurationType | string, componentId: string): void {
        this.configurationComponents.set(type, componentId);
    }

    public static getConfigurationComponentTemplate(type: ConfigurationType | string): any {
        const componentId = this.getInstance().configurationComponents.get(type);
        return this.getComponentTemplate(componentId);
    }

    public async hasPlugin(name: string): Promise<boolean> {
        if (!this.releaseInfo) {
            this.releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
        }
        return this.releaseInfo?.plugins?.some((p) => p.product === name);
    }

    public async getBackenTimezoneOffset(): Promise<number> {
        if (!this.releaseInfo) {
            this.releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
        }
        return this.releaseInfo?.backendSystemInfo?.TimeZoneOffset;
    }
}
