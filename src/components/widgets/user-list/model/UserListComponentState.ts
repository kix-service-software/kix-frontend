import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { UserListSettings } from './UserListSettings';

export class UserListComponentState extends WidgetComponentState<UserListSettings> {

    public users: any[] = [];

}
