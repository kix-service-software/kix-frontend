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

    public constructor(service?: Service) {
        super(service);
        if (service) {
            this.ObjectId = service.ServiceID;
            this.ServiceID = service.ServiceID;
            this.Name = service.Name;
            this.NameShort = service.NameShort;
            this.Comment = service.Comment;
            this.TypeID = service.TypeID;
            this.Criticality = service.Criticality;
            this.CreateBy = service.CreateBy;
            this.CreateTime = service.CreateTime;
            this.ChangeBy = service.ChangeBy;
            this.ChangeTime = service.ChangeTime;
            this.ValidID = service.ValidID;
            this.IncidentState = service.IncidentState;

            this.SubServices = service.SubServices
                ? service.SubServices.map((s) => new Service(s))
                : [];
        }
    }

    public equals(object: Service): boolean {
        return object.ServiceID === this.ServiceID;
    }

    public getIdPropertyName(): string {
        return 'ServiceID';
    }
}
