import { RequestObject } from '../RequestObject';

export class CreateMailAccount extends RequestObject {

    public constructor(
        login: string, password: string, host: string, type: string, dispatchingBy: string,
        imapFolder: string = null, trusted: number = 0, queueId: number = null, comment: string = null,
        validId: number = null
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
