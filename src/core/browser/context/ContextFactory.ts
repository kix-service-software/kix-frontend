import {
    ContextConfiguration, Context, KIXObjectType, ContextMode,
    ContextDescriptor, ContextType, DialogContextDescriptor
} from "../../model";
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
    private contextCreatePromises: Map<string, Promise<any>> = new Map();

    public registerContext(contextDescriptor: ContextDescriptor): void {
        this.registeredContexts.push(contextDescriptor);
    }

    public async getContext(
        contextId: string, kixObjectType: KIXObjectType, contextMode: ContextMode,
        objectId?: string | number, reset?: boolean
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
            context = await this.createContextInstance(contextId, kixObjectType, contextMode, objectId);
        } else if (reset) {
            const configuration = await ContextSocketClient.getInstance()
                .loadContextConfiguration<ContextConfiguration>(context.getDescriptor().contextId);
            context.setConfiguration(configuration);
            context.reset();
        }

        return context;
    }

    public getContextDescriptor<D extends ContextDescriptor = ContextDescriptor | DialogContextDescriptor>(
        contextId: string
    ): D {
        const descriptor = this.registeredContexts.find((c) => c.contextId === contextId);
        return descriptor as D;
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
        objectId?: string | number
    ): Promise<Context> {
        const promiseKey = JSON.stringify({ contextId, kixObjectType, contextMode, objectId });
        if (!this.contextCreatePromises.has(promiseKey)) {
            const promise = new Promise<Context>(async (resolve, reject) => {
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
                    const configuration = await ContextSocketClient.getInstance()
                        .loadContextConfiguration<ContextConfiguration>(descriptor.contextId);
                    context = new descriptor.contextClass(descriptor, objectId, configuration);
                    await context.initContext();
                }

                resolve(context);
            });
            this.contextCreatePromises.set(
                promiseKey, promise
            );
        }
        const newContext = await this.contextCreatePromises.get(promiseKey).catch(() => {
            return null;
        });
        if (newContext) {
            if (!this.contextInstances.some(
                (c) => c.getDescriptor().contextId === newContext.getDescriptor().contextId)
            ) {
                this.contextInstances.push(newContext);
            }
        }
        this.contextCreatePromises.delete(promiseKey);
        return newContext;
    }

    public resetDialogContexts(): void {
        this.contextInstances.filter((c) => c.getDescriptor().contextType === ContextType.DIALOG)
            .forEach((c) => c.reset());
    }

}
