export class CreatePermissionDescription {

    public constructor(
        public TypeID: number,
        public Target: string,
        public IsRequired: number,
        public Value: number,
        public comment: string = '',
        public RoleID?: number,
        public ID?: number
    ) { }

}
