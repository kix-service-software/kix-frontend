import { ActionSocketListener } from './../socket/ActionSocketListener';
import { UIProperty } from './../../../../model/client/UIProperty';

export class DeleteActionState {

    public running: boolean = false;

    public socketListener: ActionSocketListener;

}
