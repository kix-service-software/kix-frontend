/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from '../../../../model/IKIXModuleExtension';

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

    public async init(modules: IKIXModuleExtension[]): Promise<void> {
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
        const template = component ? require(component) : undefined;
        if (!template) {
            console.warn(`No template found for component: ${componentId}`);
        }
        return template;
    }

}
