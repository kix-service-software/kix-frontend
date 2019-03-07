import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class UserPreference extends KIXObject<UserPreference> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.PERSONAL_SETTINGS;

    public UserID: number;
    public ID: string;
    public Value: string;

    public constructor(userPreference?: UserPreference) {
        super();
        if (userPreference) {
            this.UserID = Number(userPreference.UserID);
            this.ID = userPreference.ID;
            this.ObjectId = this.ID;
            this.Value = userPreference.Value;
        }
    }

    public equals(userPreference: UserPreference): boolean {
        return userPreference.UserID === this.UserID && userPreference.ID === this.ID;
    }
}
