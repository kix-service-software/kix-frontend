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
            instanceId: "20170920072542",
            title: "Neue Tickets",
        });
        firstRow.widgets.push({
            id: "statistics-widget",
            instanceId: "20170920084512",
            title: "Prioritäten",
        });
        firstRow.widgets.push({
            id: "search-templates-widget",
            instanceId: "20170920113214",
            title: "Suchvorlagen",
        });

        const secondRow = new ContainerRow();
        secondRow.widgets.push({
            id: "ticket-list-widget",
            instanceId: "20170920101621",
            title: "Suchvorlage: ToDos",
        });

        const thirdRow = new ContainerRow();
        thirdRow.widgets.push({
            id: "user-list-widget",
            instanceId: "20170920093015",
            title: "Agenten",
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
