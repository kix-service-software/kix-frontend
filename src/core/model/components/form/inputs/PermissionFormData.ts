export class PermissionFormData {

    public constructor(
        public CREATE: boolean = false,
        public READ: boolean = false,
        public UPDATE: boolean = false,
        public DELETE: boolean = false,
        public DENY: boolean = false,
        public IsRequired: boolean = false,
        public Comment: string = ''
    ) { }
}
