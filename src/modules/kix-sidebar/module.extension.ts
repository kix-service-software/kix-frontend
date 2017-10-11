import { IModuleFactoryExtension, KixSidebarConfiguration } from '@kix/core';

export class KixSidebarFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "kix-sidebar";
    }

    public getTemplate(): string {
        return "";
    }

    public getDefaultConfiguration(): any {
        const kixSidebarDefaultConfiguration: KixSidebarConfiguration = {
            sidebars: [
                {
                    id: "notes-sidebar",
                    instanceId: "20170915101514",
                    title: "Notes",
                    template: "/@kix/frontend$0.0.15/dist/components/sidebars/notes",
                    configurationTemplate: "/@kix/frontend$0.0.15/dist/components/sidebars/notes/configuration",
                    show: true,
                    icon: "dummy",
                    isExternal: false,
                    type: 'sidebar'
                },
                {
                    id: "notes-sidebar",
                    instanceId: "20170915094112",
                    title: "Notes 2",
                    template: "/@kix/frontend$0.0.15/dist/components/sidebars/notes",
                    configurationTemplate: "/@kix/frontend$0.0.15/dist/components/sidebars/notes/configuration",
                    icon: "dummy",
                    isExternal: false,
                    type: 'sidebar'
                },
                {
                    id: "ticket-info-sidebar",
                    instanceId: "20170915085411",
                    title: "Ticket Informationen",
                    template: "/@kix/frontend$0.0.15/dist/components/sidebars/ticket-info",
                    configurationTemplate: "/@kix/frontend$0.0.15/dist/components/sidebars/ticket-info/configuration",
                    show: true,
                    icon: "dummy",
                    isExternal: false,
                    type: 'sidebar'
                }
            ]
        };
        return kixSidebarDefaultConfiguration;
    }
}

module.exports = (data, host, options) => {
    return new KixSidebarFactoryExtension();
};
