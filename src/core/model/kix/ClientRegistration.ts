import { KIXObject } from "./KIXObject";
import { KIXObjectType } from "./KIXObjectType";

export class ClientRegistration extends KIXObject<ClientRegistration> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CLIENT_REGISTRATION;

    public ClientID: string;

    public NotificationURL: string;

    public Authorization: string;

    public NotificationInterval: number = 5;

    public constructor() {
        super();
        this.ObjectId = this.ClientID;
    }

    public equals(registration: ClientRegistration): boolean {
        return registration.ClientID === this.ClientID;
    }

    public getIdPropertyName(): string {
        return 'ClientID';
    }

}
