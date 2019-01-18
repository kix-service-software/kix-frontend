export class ComponentRouter {

    public constructor(
        public routerId: string,
        public componentId: string = null,
        public parameterValue: string = null,
        public data: any = null
    ) { }

}
