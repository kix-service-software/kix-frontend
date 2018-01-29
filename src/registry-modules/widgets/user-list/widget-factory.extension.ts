import { IWidget, UIProperty, WidgetConfiguration, IAction, WidgetSize, WidgetType } from '@kix/core/dist/model';
import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { UserListSettings } from './../../../components/widgets/user-list/model/UserListSettings';
import { UserListWidget } from './UserListWidget';

export class UserlistWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "user-list-widget";

    public type: WidgetType = WidgetType.CONTENT;

    public createWidget(): IWidget {
        return new UserListWidget(this.widgetId);
    }

    public getDefaultConfiguration(): WidgetConfiguration<UserListSettings> {
        const userListConfiguration = new UserListSettings();
        userListConfiguration.properties.push(new UIProperty("UserID", "ID"));
        userListConfiguration.properties.push(new UIProperty("UserFirstname", "Vorname"));
        userListConfiguration.properties.push(new UIProperty("UserLastname", "Nachname"));
        userListConfiguration.properties.push(new UIProperty("UserEmail", "Email"));

        return new WidgetConfiguration(
            this.widgetId, "User-List", [], userListConfiguration, this.type, true, WidgetSize.LARGE
        );
    }

}

module.exports = (data, host, options) => {
    return new UserlistWidgetFactoryExtension();
};
