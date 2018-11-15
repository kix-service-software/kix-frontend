import { ILabelProvider } from '@kix/core/dist/browser';
import { RoutingConfiguration } from '@kix/core/dist/browser/router';

export class ObjectPropertyLabelInput<T> {

    public object: any;

    public property: string;

    public labelProvider: ILabelProvider<T>;

    public info: any;

    public routingConfiguration: RoutingConfiguration;

    public showIcon: boolean;

}
