export class User {

    public UserID: number;

    public UserLogin: string;

    public UserTitle: string;

    public UserFirstname: string;

    public UserLastname: string;

    public UserFullname: string;

    // TODO: really the password in the object???
    public UserPw: string;

    // TODO: make a enumeration for valid types.
    public ValidID: number;

    public CreateTime: string;

    public ChangeTime: string;

    public Preferences: any[];

}