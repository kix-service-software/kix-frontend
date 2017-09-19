import { IWidget } from './../../model/client/components/widget/IWidget';

export interface IWidgetFactoryExtension {

    createWidget(): IWidget;

    getWidgetId(): string;

    getDefaultConfiguration(): any;

}
