import { ContainerRow } from './../../model/client/components/draggable-container/ContainerRow';
import { ContainerConfiguration } from './../../model/client/components/';
import { IModuleFactoryExtension } from './../../extensions/';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "dashboard";
    }

    public getDefaultConfiguration(): any {
        const content = new ContainerConfiguration();

        const firstRow = new ContainerRow();

        firstRow.widgets.push({
            id: "statistics-widget",
            title: "Neue Tickets",
            template: "widgets/statistics",
            configurationTemplate: "widgets/statistics/configuration",
            isExternal: false
        });
        firstRow.widgets.push({
            id: "statistics-widget",
            title: "Prioritäten",
            template: "widgets/statistics",
            configurationTemplate: "widgets/statistics/configuration",
            isExternal: false
        });
        firstRow.widgets.push({
            id: "search-templates-widget",
            title: "Suchvorlagen",
            template: "widgets/search-templates",
            configurationTemplate: "widgets/search-templates/configuration",
            isExternal: false
        });

        const secondRow = new ContainerRow();
        secondRow.widgets.push({
            id: "ticket-list-widget",
            title: "Suchvorlage: ToDos",
            template: "widgets/ticket-list",
            configurationTemplate: "widgets/ticket-list/configuration",
            isExternal: false
        });

        const thirdRow = new ContainerRow();
        thirdRow.widgets.push({
            id: "user-list-widget",
            title: "Agenten",
            template: "widgets/user-list",
            configurationTemplate: "widgets/user-list/configuration",
            isExternal: false
        });

        content.rows.push(firstRow);
        content.rows.push(secondRow);
        content.rows.push(thirdRow);

        return content;
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
