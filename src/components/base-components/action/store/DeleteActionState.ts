import { ActionSocketListener } from './../socket/ActionSocketListener';
import { UIProperty } from '@kix/core';

export class DeleteActionState {

    public running: boolean = false;

    public socketListener: ActionSocketListener;

}
