import { UserListConfiguration } from './../model/UserListConfiguration';
import { UIProperty, WidgetConfiguration } from '@kix/core/dist/model/client';
import { UserListSocketListener } from './../socket/UserListSocketListener';

export class UserListState {

    public users: any[] = [];

    public configuration: UserListConfiguration;

    public socketListener: UserListSocketListener;

    public widgetConfiguration: WidgetConfiguration;

    public error: string;

}
