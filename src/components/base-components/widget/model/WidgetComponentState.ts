import { WidgetConfiguration } from './../../../../model/client/components/widget/WidgetConfiguration';
import { IWidget } from './../../../../model/client/components/widget/IWidget';

export class WidgetComponentState {

    public configurationMode: boolean = false;

    public showConfiguration: boolean = false;

    public actions: string[] = [];

    public contentConfiguration: any = null;

    public widget: IWidget = null;

}
