import { DeleteActionSocketListener } from './../socket/DeleteActionSocketListener';
import { UIProperty } from './../../../../model/client/UIProperty';

export class DeleteActionState {

    public running: boolean = false;

    public socketListener: DeleteActionSocketListener;

}
