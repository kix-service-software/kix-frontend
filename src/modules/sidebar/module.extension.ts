import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { SidebarConfiguration, WidgetSize } from '@kix/core/dist/model';

export class SidebarFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "sidebar";
    }

    public getTemplate(): string {
        return "";
    }

    public getDefaultConfiguration(): any {
        const sidebarDefaultConfiguration: SidebarConfiguration = {};
        return sidebarDefaultConfiguration;
    }
}

module.exports = (data, host, options) => {
    return new SidebarFactoryExtension();
};
