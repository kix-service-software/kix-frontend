import { IncidentState } from './IncidentState';
import { KIXObject } from '../KIXObject';
import { KIXObjectType } from '../KIXObjectType';

export class Service extends KIXObject<Service> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.SERVICE;


    public ServiceID: number;
    public Name: string;
    public NameShort: string;
    public Comment: string;
    public TypeID: number;
    public Criticality: string;
    public CreateBy: number;
    public CreateTime: string;
    public ChangeBy: number;
    public ChangeTime: string;
    public ValidID: number;
    public IncidentState: IncidentState;
    public SubServices: Service[];

    public constructor() {
        super();
        this.ObjectId = this.ServiceID;
    }

    public equals(object: Service): boolean {
        return object.ServiceID === this.ServiceID;
    }

    public getIdPropertyName(): string {
        return 'ServiceID';
    }
}
