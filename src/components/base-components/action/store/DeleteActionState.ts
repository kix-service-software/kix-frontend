import { ActionSocketListener } from './../socket/ActionSocketListener';
import { UIProperty } from '@kix/core/dist/model/client';

export class DeleteActionState {

    public running: boolean = false;

    public socketListener: ActionSocketListener;

}
