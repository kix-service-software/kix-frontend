import { KIXObject } from "./../KIXObject";
import { KIXObjectType } from "./../KIXObjectType";
import { MailFilterMatch } from "./MailFilterMatch";
import { MailFilterSet } from "./MailFilterSet";

export class MailFilter extends KIXObject {

    public KIXObjectType: KIXObjectType;

    public ObjectId: string | number;

    public ID: string | number;
    public Name: string;
    public StopAfterMatch: number;
    public Match: MailFilterMatch[];
    public Set: MailFilterSet[];

    public constructor(mailFilter?: MailFilter) {
        super(mailFilter);
        if (mailFilter) {
            this.ID = mailFilter.ID;
            this.ObjectId = this.ID;
            this.Name = mailFilter.Name;
            this.StopAfterMatch = mailFilter.StopAfterMatch;
            this.Match = mailFilter.Match;
            this.Set = mailFilter.Set;
        }
    }

}
