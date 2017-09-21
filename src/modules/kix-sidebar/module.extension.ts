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
                    template: "/@kix/frontend$0.0.15/dist/components/sidebars/notes",
                    configurationTemplate: "/@kix/frontend$0.0.15/dist/components/sidebars/notes/configuration",
                    show: true,
                    icon: "dummy",
                    isExternal: false
                },
                {
                    id: "notes-sidebar",
                    title: "Notes 2",
                    template: "/@kix/frontend$0.0.15/dist/components/sidebars/notes",
                    configurationTemplate: "/@kix/frontend$0.0.15/dist/components/sidebars/notes/configuration",
                    icon: "dummy",
                    isExternal: false
                },
                {
                    id: "ticket-info-sidebar",
                    title: "Ticket Informationen",
                    template: "/@kix/frontend$0.0.15/dist/components/sidebars/ticket-info",
                    configurationTemplate: "/@kix/frontend$0.0.15/dist/components/sidebars/ticket-info/configuration",
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
