import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetSize } from '@kix/core/dist/model';

export class SidebarFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "sidebar";
    }

    public getTemplate(): string {
        return "";
    }

    public getDefaultConfiguration(): any {
        return {};
    }
}

module.exports = (data, host, options) => {
    return new SidebarFactoryExtension();
};
