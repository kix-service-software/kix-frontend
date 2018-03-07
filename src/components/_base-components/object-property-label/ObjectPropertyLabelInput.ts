import { ILabelProvider } from '@kix/core/dist/browser';

export class ObjectPropertyLabelInput<T> {

    public object: any;

    public property: string;

    public labelProvider: ILabelProvider<T>;

    public info: any;

}
