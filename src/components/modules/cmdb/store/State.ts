import { CMDBSocketListener } from './../socket/SocketListener';

export class CMDBState {

    public rows: string[][] = [];

    public socketListener: CMDBSocketListener = null;

}
