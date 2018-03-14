import { StandardTable } from '@kix/core/dist/browser';
import { KIXObject } from '@kix/core/dist/model';

export class StandardTableInput<T extends KIXObject<T>> {

    public standardTable: StandardTable<T>;

}
