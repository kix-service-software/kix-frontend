/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from '../../../../model/configuration/ConfigurationType';
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

    public static urlPrefix = '';

    private releaseInfo: ReleaseInfo;

    public async init(modules: IKIXModuleExtension[]): Promise<void> {
        this.tags = new Map();
        this.modules = modules;
        this.modules.forEach((m) => {
            m.uiComponents.forEach((c) => this.tags.set(c.tagId, c.componentPath));
        });

        await this.initModules();
    }

    private async initModules(): Promise<void> {
        const modules = KIXModulesService.getInstance().getModules();

        const requireStart = Date.now();
        const uiModules: IUIModule[] = [];
        for (const mod of modules) {
            for (const c of mod.initComponents) {
                try {
                    const component = require(c.componentPath);
                    if (component && component.UIModule) {
                        uiModules.push(new component.UIModule());
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
        const requireEnd = Date.now();
        console.debug(`Require ${modules.length} modules in ${requireEnd - requireStart}ms`);

        const moduleStart = Date.now();
        uiModules.sort((a, b) => a.priority - b.priority);
        for (let i = 0; i < uiModules.length; i++) {
            if (uiModules[i].register) {
                const start = Date.now();
                await uiModules[i].register();
                const end = Date.now();
                console.debug(`register module: ${uiModules[i].priority} - ${uiModules[i].name} - ${end - start}ms`);
            } else {
                console.warn(`module with prioritiy ${uiModules[i].priority} did not implement register() method.`);
            }
            const percent = Math.round((i / uiModules.length) * 100);
        }
        const moduleEnd = Date.now();
        console.debug(`Init modules in ${moduleEnd - moduleStart}ms`);
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
}
