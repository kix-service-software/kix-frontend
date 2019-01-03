import { ILabelProvider } from '../../../core/browser';
import { RoutingConfiguration } from '../../../core/browser/router';

export class ObjectPropertyLabelInput<T> {

    public object: any;

    public property: string;

    public labelProvider: ILabelProvider<T>;

    public info: any;

    public routingConfiguration: RoutingConfiguration;

    public showIcon: boolean;

    public showText: boolean;

}
