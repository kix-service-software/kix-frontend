import { IModuleFactoryExtension, KixSidebarConfiguration } from '@kix/core';

export class KixSidebarFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "kix-sidebar";
    }

    public getDefaultConfiguration(): any {
        const kixSidebarDefaultConfiguration: KixSidebarConfiguration = {
            sidebars: [
                {
                    id: "notes-sidebar",
                    title: "Notes",
                    template: "sidebars/notes",
                    configurationTemplate: "sidebars/notes/configuration",
                    show: true,
                    icon: "dummy",
                    isExternal: false
                },
                {
                    id: "notes-sidebar",
                    title: "Notes 2",
                    template: "sidebars/notes",
                    configurationTemplate: "sidebars/notes/configuration",
                    icon: "dummy",
                    isExternal: false
                },
                {
                    id: "ticket-info-sidebar",
                    title: "Ticket Informationen",
                    template: "sidebars/ticket-info",
                    configurationTemplate: "sidebars/ticket-info/configuration",
                    show: true,
                    icon: "dummy",
                    isExternal: false
                }
            ]
        };
        return kixSidebarDefaultConfiguration;
    }
}

module.exports = (data, host, options) => {
    return new KixSidebarFactoryExtension();
};
