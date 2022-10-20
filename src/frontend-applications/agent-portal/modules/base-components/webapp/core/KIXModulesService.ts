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

    private releaseInfo: ReleaseInfo;

    public init(modules: IKIXModuleExtension[]): void {
        this.tags = new Map();
        this.modules = modules;
        this.modules.forEach((m) => {
            m.uiComponents.forEach((c) => this.tags.set(c.tagId, c.componentPath));
        });
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
