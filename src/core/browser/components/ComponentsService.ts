export class ComponentsService {

    private static INSTANCE: ComponentsService;

    private constructor() { }

    private componentsCache: Array<[string, string]> = [];

    public static getInstance(): ComponentsService {
        if (!ComponentsService.INSTANCE) {
            ComponentsService.INSTANCE = new ComponentsService();
        }
        return ComponentsService.INSTANCE;
    }

    public async init(tags: Array<[string, string]>): Promise<void> {
        this.componentsCache = tags;
    }

    public getComponentTemplate(componentId: string): any {
        const component = this.componentsCache.find((c) => c[0] === componentId);
        const template = component ? require(component[1]) : undefined;
        return template;
    }

}
