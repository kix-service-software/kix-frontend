import { ActionSocketListener } from './../socket/ActionSocketListener';
import { UIProperty } from '@kix/core/dist/model';

export class DeleteActionState {

    public running: boolean = false;

    public socketListener: ActionSocketListener;

}
