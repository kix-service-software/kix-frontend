import { AssignTourAction } from './../../actions/assign-tour/AssignTourAction';
import { DeleteAction } from './../../actions/delete/DeleteAction';
import { IWidgetFactoryExtension, IWidget, UIProperty, WidgetConfiguration, IAction } from '@kix/core';
import { UserListSettings } from './../../../components/widgets/user-list/model/UserListSettings';
import { UserListWidget } from './UserListWidget';

export class UserlistWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebar: boolean = false;
    public isContentWidget: boolean = true;
    public widgetId: string = "user-list-widget";

    public createWidget(): IWidget {
        return new UserListWidget(this.widgetId);
    }

    public getTemplate(): string {
        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/widgets/user-list';
    }

    public getConfigurationTemplate(): string {
        return this.getTemplate() + '/configuration';
    }

    public getDefaultConfiguration(): WidgetConfiguration {
        const userListConfiguration = new UserListSettings();
        userListConfiguration.properties.push(new UIProperty("UserID", "ID"));
        userListConfiguration.properties.push(new UIProperty("UserFirstname", "Vorname"));
        userListConfiguration.properties.push(new UIProperty("UserLastname", "Nachname"));
        userListConfiguration.properties.push(new UIProperty("UserEmail", "Email"));

        // TODO: Remove the logic of actions from here. On place is only content config (settings) relevant.
        const deleteAction = new DeleteAction("delete-action", "Delete", "");
        const tourAction = new AssignTourAction("assign-tour-action", "Assign Tour", "");
        return new WidgetConfiguration("User-List", [deleteAction, tourAction], userListConfiguration);
    }

}

module.exports = (data, host, options) => {
    return new UserlistWidgetFactoryExtension();
};
