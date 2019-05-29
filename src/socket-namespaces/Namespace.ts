import { SocketNameSpace } from './SocketNameSpace';
import { NotificationEvent } from '../core/model';

export class NotificationNamespace extends SocketNameSpace {

    private static INSTANCE: NotificationNamespace;

    public static getInstance(): NotificationNamespace {
        if (!NotificationNamespace.INSTANCE) {
            NotificationNamespace.INSTANCE = new NotificationNamespace();
        }
        return NotificationNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'notifications';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        return;
    }

    public broadcast(content: any): void {
        this.namespace.emit(NotificationEvent.MESSAGE, content);
    }

}
