import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ContainerConfiguration, ContainerRow } from '@kix/core/dist/model';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/modules/dashboard/';
    }

    public getModuleId(): string {
        return "dashboard";
    }

    public getDefaultConfiguration(): any {
        const content = new ContainerConfiguration();

        const firstRow = new ContainerRow();

        firstRow.widgets.push({
            id: "chart-widget",
            instanceId: "20170920072542",
            show: true
        });
        firstRow.widgets.push({
            id: "chart-widget",
            instanceId: "20170920084512",
            show: true
        });
        firstRow.widgets.push({
            id: "search-templates-widget",
            instanceId: "20170920113214",
            show: true
        });

        const secondRow = new ContainerRow();
        secondRow.widgets.push({
            id: "ticket-list-widget",
            instanceId: "20170920101621",
            show: true
        });

        const thirdRow = new ContainerRow();
        thirdRow.widgets.push({
            id: "user-list-widget",
            instanceId: "20170920093015",
            show: true
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
