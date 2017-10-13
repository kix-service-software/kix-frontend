import { IModuleFactoryExtension, SidebarConfiguration } from '@kix/core';

export class SidebarFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "sidebar";
    }

    public getTemplate(): string {
        return "";
    }

    public getDefaultConfiguration(): any {
        const sidebarDefaultConfiguration: SidebarConfiguration = {
            widgets: [
                {
                    id: "notes-widget",
                    instanceId: "20170915101514",
                    icon: 'dummy',
                    show: true
                },
                {
                    id: "notes-widget",
                    instanceId: "20170915094112",
                    icon: 'dummy',
                    show: true
                },
                {
                    id: "ticket-info-widget",
                    instanceId: "20170915085411",
                    icon: 'dummy',
                    show: true
                }
            ]
        };
        return sidebarDefaultConfiguration;
    }
}

module.exports = (data, host, options) => {
    return new SidebarFactoryExtension();
};
