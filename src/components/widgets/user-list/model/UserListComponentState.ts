import { UserListConfiguration } from './UserListConfiguration';
import { UIProperty, WidgetConfiguration } from '@kix/core/dist/model/client';

export class UserListComponentState {

    public users: any[] = [];

    public configuration: UserListConfiguration = new UserListConfiguration();

    public error: string = null;

    public instanceId: string = null;

    public widgetConfiguration: WidgetConfiguration = null;

}
