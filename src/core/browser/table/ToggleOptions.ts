export class ToggleOptions {

    public constructor(
        public componentId: string,
        public inputPropertyName: string,
        public actions: string[] = [],
        public toggleFirst: boolean = false
    ) { }
}
