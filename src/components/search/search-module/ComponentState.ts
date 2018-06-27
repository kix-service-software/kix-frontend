export class ComponentState {
    public constructor(
        public criterias: Array<[string, string, string]> = [],
        public fromHistory: boolean = false
    ) { }
}
