import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class TextModule extends KIXObject<TextModule> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.TEXT_MODULE;

    public ID: number;

    public Name: string;

    public Text: string;

    public Keywords: string[];

    public Comment: string;

    public Subject: string;

    public Language: string;

    public Category: string;

    public AgentFrontend: number;

    public CustomerFrontend: number;

    public PublicFrontend: number;

    public ValidID: number;

    public CreatedBy: number;

    public CreateTime: string;

    public ChangedBy: number;

    public ChangeTime: string;

    public equals(textModule: TextModule): boolean {
        return this.ID === textModule.ID;
    }

    public constructor(textModule?: TextModule) {
        super();
        if (textModule) {
            this.ID = textModule.ID;
            this.ObjectId = this.ID;
            this.Name = textModule.Name;
            this.Text = textModule.Text;
            this.Keywords = textModule.Keywords;
            this.Comment = textModule.Comment;
            this.Subject = textModule.Subject;
            this.Language = textModule.Language;
            this.Category = textModule.Category;
            this.AgentFrontend = textModule.AgentFrontend;
            this.CustomerFrontend = textModule.CustomerFrontend;
            this.PublicFrontend = textModule.PublicFrontend;
            this.ValidID = textModule.ValidID;
        }
    }

}
