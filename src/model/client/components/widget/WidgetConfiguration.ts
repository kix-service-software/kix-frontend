import { IAction } from './../action/IAction';

export class WidgetConfiguration {

    public actions: IAction[];

    public contentConfiguation: any;

    public constructor(actions: IAction[], contentConfiguration: any) {
        this.actions = actions;
        this.contentConfiguation = contentConfiguration;
    }

}
