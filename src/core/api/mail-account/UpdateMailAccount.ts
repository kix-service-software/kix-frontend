import { RequestObject } from '../RequestObject';

export class UpdateMailAccount extends RequestObject {

    public constructor(
        login: string = null, password: string = null, host: string = null, type: string = null,
        dispatchingBy: string = null, imapFolder: string = null, trusted: number = null,
        queueId: number = null, comment: string = null, validId: number = null
    ) {
        super();
        this.applyProperty('Login', login);
        this.applyProperty('Password', password);
        this.applyProperty('Host', host);
        this.applyProperty('Type', type);
        this.applyProperty('DispatchingBy', dispatchingBy);
        this.applyProperty('IMAPFolder', imapFolder);
        this.applyProperty('Trusted', trusted);
        this.applyProperty('QueueID', queueId);
        this.applyProperty('Comment', comment);
        this.applyProperty('ValidID', validId);
    }

}
