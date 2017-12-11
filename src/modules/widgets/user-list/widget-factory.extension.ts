import { AssignTourAction } from './../../actions/assign-tour/AssignTourAction';
import { DeleteAction } from './../../actions/delete/DeleteAction';
import { IWidget, UIProperty, WidgetConfiguration, IAction, WidgetSize } from '@kix/core/dist/model';
import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { UserListSettings } from './../../../components/widgets/user-list/model/UserListSettings';
import { UserListWidget } from './UserListWidget';

export class UserlistWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebar: boolean = false;
    public isContentWidget: boolean = true;
    public widgetId: string = "user-list-widget";

    public createWidget(): IWidget {
        return new UserListWidget(this.widgetId);
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
        return new WidgetConfiguration(
            this.widgetId, "User-List", [deleteAction, tourAction], userListConfiguration, true, WidgetSize.LARGE
        );
    }

}

module.exports = (data, host, options) => {
    return new UserlistWidgetFactoryExtension();
};
