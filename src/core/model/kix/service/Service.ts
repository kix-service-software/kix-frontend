/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
