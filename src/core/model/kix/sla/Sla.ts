import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class Sla extends KIXObject<Sla> {

    public KIXObjectType: KIXObjectType = KIXObjectType.SLA;

    public ObjectId: string | number;

    public SLAID: number;

    public ChangeTime: string;

    public ChangeBy: number;

    public CreateTime: string;

    public CreateBy: number;

    public ValidID: number;

    public Name: string;

    public Comment: string;

    public Calendar: string;

    public TypeID: string;

    public Type: string;

    public MinTimeBetweenIncidents: number;

    public FirstResponseTime: number;

    public FirstResponseNotify: number;

    public SolutionTime: number;

    public SolutionNotify: number;

    public UpdateNotify: number;

    public UpdateTime: number;

    public constructor(sla?: Sla) {
        super();
        if (sla) {
            this.SLAID = Number(sla.SLAID);
            this.ObjectId = this.SLAID;
            this.ChangeTime = sla.ChangeTime;
            this.ChangeBy = sla.ChangeBy;
            this.FirstResponseTime = sla.FirstResponseTime;
            this.ValidID = sla.ValidID;
            this.CreateTime = sla.CreateTime;
            this.CreateBy = sla.CreateBy;
            this.Comment = sla.Comment;
            this.SolutionTime = sla.SolutionTime;
            this.Type = sla.Type;
            this.Calendar = sla.Calendar;
            this.UpdateNotify = sla.UpdateNotify;
            this.UpdateTime = sla.UpdateTime;
            this.TypeID = sla.TypeID;
            this.Name = sla.Name;
            this.MinTimeBetweenIncidents = sla.MinTimeBetweenIncidents;
            this.FirstResponseNotify = sla.FirstResponseNotify;
            this.SolutionNotify = sla.SolutionNotify;
        }
    }

    public equals(sla: Sla): boolean {
        return sla.SLAID === this.SLAID;
    }

    public getIdPropertyName(): string {
        return 'SLAID';
    }

}
