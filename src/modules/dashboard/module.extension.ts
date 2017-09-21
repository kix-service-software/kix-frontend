import { ContainerRow, ContainerConfiguration, IModuleFactoryExtension } from '@kix/core';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/dashboard/';
    }

    public getModuleId(): string {
        return "dashboard";
    }

    public getDefaultConfiguration(): any {
        const content = new ContainerConfiguration();

        const firstRow = new ContainerRow();

        firstRow.widgets.push({
            id: "statistics-widget",
            title: "Neue Tickets",
            template: "/@kix/frontend$0.0.15/dist/components/widgets/statistics",
            configurationTemplate: "/@kix/frontend$0.0.15/dist/components/widgets/statistics/configuration",
            isExternal: false
        });
        firstRow.widgets.push({
            id: "statistics-widget",
            title: "Prioritäten",
            template: "/@kix/frontend$0.0.15/dist/components/widgets/statistics",
            configurationTemplate: "/@kix/frontend$0.0.15/dist/components/widgets/statistics/configuration",
            isExternal: false
        });
        firstRow.widgets.push({
            id: "search-templates-widget",
            title: "Suchvorlagen",
            template: "/@kix/frontend$0.0.15/dist/components/widgets/search-templates",
            configurationTemplate: "/@kix/frontend$0.0.15/dist/components/widgets/search-templates/configuration",
            isExternal: false
        });

        const secondRow = new ContainerRow();
        secondRow.widgets.push({
            id: "ticket-list-widget",
            title: "Suchvorlage: ToDos",
            template: "/@kix/frontend$0.0.15/dist/components/widgets/ticket-list",
            configurationTemplate: "/@kix/frontend$0.0.15/dist/components/widgets/ticket-list/configuration",
            isExternal: false
        });

        const thirdRow = new ContainerRow();
        thirdRow.widgets.push({
            id: "user-list-widget",
            title: "Agenten",
            template: "/@kix/frontend$0.0.15/dist/components/widgets/user-list",
            configurationTemplate: "/@kix/frontend$0.0.15/dist/components/widgets/user-list/configuration",
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
