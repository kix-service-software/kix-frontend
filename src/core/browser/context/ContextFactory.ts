import { ContextConfiguration, Context, KIXObjectType, ContextMode, ContextDescriptor } from "../../model";
import { ContextSocketClient } from "./ContextSocketClient";

export class ContextFactory {

    private static INSTANCE: ContextFactory;

    public static getInstance(): ContextFactory {
        if (!ContextFactory.INSTANCE) {
            ContextFactory.INSTANCE = new ContextFactory();
        }
        return ContextFactory.INSTANCE;
    }

    private constructor() { }

    private registeredContexts: ContextDescriptor[] = [];
    private contextInstances: Array<Context<ContextConfiguration>> = [];

    public registerContext(contextDescriptor: ContextDescriptor): void {
        this.registeredContexts.push(contextDescriptor);
    }

    public async getContext(
        contextId: string, kixObjectType: KIXObjectType, contextMode: ContextMode,
        objectId?: string | number, reset?: boolean, loadConfig: boolean = true
    ): Promise<Context> {
        let context: Context;

        if (contextId) {
            context = this.contextInstances.find((c) => c.getDescriptor().contextId === contextId);
        } else {
            context = this.contextInstances.find(
                (c) => c.getDescriptor().isContextFor(kixObjectType) && c.getDescriptor().contextMode === contextMode
            );
        }

        if (!context) {
            context = await this.createContextInstance(contextId, kixObjectType, contextMode, objectId, loadConfig);
        } else if (reset) {
            const configuration = await ContextSocketClient.getInstance()
                .loadContextConfiguration<ContextConfiguration>(context.getDescriptor().contextId);
            context.setConfiguration(configuration);
            context.reset();
        }

        return context;
    }

    public getContextDescriptor(contextId: string): ContextDescriptor {
        const descriptor = this.registeredContexts.find((c) => c.contextId === contextId);
        return descriptor;
    }

    public async getContextForUrl(
        contextUrl: string, objectId: string | number, contextMode: ContextMode
    ): Promise<Context> {
        let context;
        if (!contextMode) {
            contextMode = ContextMode.DASHBOARD;

            if (objectId) {
                contextMode = ContextMode.DETAILS;
            }
        }

        context = this.contextInstances.find(
            (c) => c.getDescriptor().contextMode === contextMode
                && c.getDescriptor().urlPaths.some((u) => u === contextUrl)
        );

        if (!context) {
            const descriptor = this.registeredContexts.find(
                (cd) => cd.contextMode === contextMode
                    && cd.urlPaths.some((u) => u === contextUrl)
            );
            if (descriptor) {
                context = this.createContextInstance(descriptor.contextId, null, null);
            }
        }

        return context;
    }

    private async createContextInstance(
        contextId: string, kixObjectType: KIXObjectType, contextMode: ContextMode,
        objectId?: string | number, loadConfig: boolean = true
    ): Promise<Context> {
        let descriptor;
        if (contextId) {
            descriptor = this.registeredContexts.find((rc) => rc.contextId === contextId);
        } else {
            descriptor = this.registeredContexts.find(
                (cd) => cd.isContextFor(kixObjectType) && cd.contextMode === contextMode
            );
        }

        let context;
        if (descriptor) {
            let configuration;
            if (loadConfig) {
                configuration = await ContextSocketClient.getInstance()
                    .loadContextConfiguration<ContextConfiguration>(descriptor.contextId);
            }
            context = new descriptor.contextClass(descriptor, objectId, configuration);
            await context.initContext();
            this.contextInstances.push(context);
        }

        return context;
    }

}
