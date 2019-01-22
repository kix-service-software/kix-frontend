import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { Tickets } from "./Tickets";
import { UserPreference } from "./UserPreference";

export class User extends KIXObject<User> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.USER;

    public UserID?: number;
    public UserLogin?: string;
    public UserTitle?: string;
    public UserFirstname?: string;
    public UserLastname?: string;
    public UserFullname?: string;

    // TODO: make a enumeration for valid types.
    public ValidID?: number;

    public CreateTime?: string;
    public ChangeTime?: string;

    public Preferences: UserPreference[];
    public Tickets: Tickets;

    public constructor(user?: User) {
        super();
        if (user) {
            this.UserID = Number(user.UserID);
            this.ObjectId = this.UserID;
            this.UserLogin = user.UserLogin;
            this.UserTitle = user.UserTitle;
            this.UserFirstname = user.UserFirstname;
            this.UserLastname = user.UserLastname;
            this.UserFullname = user.UserFullname;
            this.ValidID = user.ValidID;
            this.CreateTime = user.CreateTime;
            this.ChangeTime = user.ChangeTime;
            this.Preferences = user.Preferences;
            this.Tickets = user.Tickets;

            if (this.Tickets) {
                this.Tickets.Owned = this.Tickets.Owned.map((t) => Number(t));
                this.Tickets.OwnedAndLocked = this.Tickets.OwnedAndLocked.map((t) => Number(t));
                this.Tickets.OwnedAndLockedAndUnseen = this.Tickets.OwnedAndLockedAndUnseen.map((t) => Number(t));
                this.Tickets.OwnedAndUnseen = this.Tickets.OwnedAndUnseen.map((t) => Number(t));
                this.Tickets.Watched = this.Tickets.Watched.map((t) => Number(t));
                this.Tickets.WatchedAndUnseen = this.Tickets.WatchedAndUnseen.map((t) => Number(t));
            }
            this.Preferences = this.Preferences ? this.Preferences.map((p) => new UserPreference(p)) : [];
        }
    }

    public equals(user: User): boolean {
        return user.UserID === this.UserID;
    }

    public getIdPropertyName(): string {
        return 'UserID';
    }
}
