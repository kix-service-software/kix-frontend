/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextSocketClient } from './ContextSocketClient';
import { AdditionalContextInformation } from './AdditionalContextInformation';
import { FormService } from './FormService';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextType } from '../../../../model/ContextType';
import { Context } from '../../../../model/Context';
import { AuthenticationSocketClient } from './AuthenticationSocketClient';

export class ContextFactory {

    private static INSTANCE: ContextFactory;

    public static getInstance(): ContextFactory {
        if (!ContextFactory.INSTANCE) {
            ContextFactory.INSTANCE = new ContextFactory();
        }
        return ContextFactory.INSTANCE;
    }

    private constructor() { }

    private registeredDescriptors: ContextDescriptor[] = [];
    private contextInstances: Context[] = [];
    private contextCreatePromises: Map<string, Promise<any>> = new Map();

    public registerContext(contextDescriptor: ContextDescriptor): void {
        if (!this.registeredDescriptors.some(
            (cd) => ContextFactory.checkIfContextsAreSame(cd, contextDescriptor)
        )) {
            this.registeredDescriptors.push(contextDescriptor);
        }
    }

    private static checkIfContextsAreSame(cd: ContextDescriptor, cd2: ContextDescriptor): unknown {
        return cd.contextMode === cd2.contextMode
            && cd.contextType === cd2.contextType
            && cd.contextId === cd2.contextId
            && cd.kixObjectTypes.length === cd2.kixObjectTypes.length
            && cd.kixObjectTypes.every((t) => cd2.kixObjectTypes.some((t2) => t === t2));
    }

    public async getContext(
        contextId: string, objectType: KIXObjectType | string, contextMode: ContextMode,
        objectId?: string | number, reset?: boolean, compareContext?: Context
    ): Promise<Context> {
        let context = this.contextInstances.find(
            (c) => this.isContext(contextId, c.getDescriptor(), objectType, contextMode)
        );

        if (compareContext && (compareContext === context)) {
            reset = false;
        }

        if (!context) {
            context = await this.createContextInstance(contextId, objectType, contextMode, objectId);
        } else if (reset) {
            const configuration = await ContextSocketClient.getInstance().loadContextConfiguration(
                context.getDescriptor().contextId
            );
            context.setConfiguration(configuration);
            context.reset();
        }

        return context;
    }

    public getContextDescriptor(contextId: string): ContextDescriptor {
        const descriptor = this.registeredDescriptors.find((c) => c.contextId === contextId);
        return descriptor;
    }

    public async getContextDescriptors(
        contextMode: ContextMode, objectType?: KIXObjectType | string
    ): Promise<ContextDescriptor[]> {
        let descriptors: ContextDescriptor[] = [];
        if (contextMode && !objectType) {
            descriptors = this.registeredDescriptors.filter((c) => c.contextMode === contextMode);
        } else if (contextMode && objectType) {
            descriptors = this.registeredDescriptors.filter(
                (c) => c.contextMode === contextMode && c.kixObjectTypes.some((ot) => ot === objectType)
            );
        }

        const allowedDescriptors: ContextDescriptor[] = [];

        for (const desc of descriptors) {
            const allowed = await AuthenticationSocketClient.getInstance().checkPermissions(desc.permissions);
            if (allowed) {
                allowedDescriptors.push(desc);
            }
        }

        return allowedDescriptors;
    }

    public static async getContextForUrl(
        contextUrl: string, objectId?: string | number, contextMode?: ContextMode
    ): Promise<Context> {
        let context;
        if (!contextMode) {
            contextMode = ContextMode.DASHBOARD;

            if (objectId) {
                contextMode = ContextMode.DETAILS;
            }
        }

        context = this.getInstance().contextInstances.find(
            (c) => this.isDescriptorForUrl(c.getDescriptor(), contextMode, contextUrl)
        );

        if (!context) {
            const descriptor = this.getInstance().registeredDescriptors.find(
                (cd) => this.isDescriptorForUrl(cd, contextMode, contextUrl)
            );

            if (descriptor) {
                context = this.getInstance().createContextInstance(descriptor.contextId);
            }
        }

        return context;
    }

    private async createContextInstance(
        contextId: string, objectType?: KIXObjectType | string, contextMode?: ContextMode, objectId?: string | number
    ): Promise<Context> {
        const promiseKey = JSON.stringify({ contextId, kixObjectType: objectType, contextMode, objectId });
        if (!this.contextCreatePromises.has(promiseKey)) {
            this.contextCreatePromises.set(
                promiseKey, this.createPromise(contextId, objectType, contextMode, objectId)
            );
        }

        const contextPromise = this.contextCreatePromises.get(promiseKey);
        const newContext = await contextPromise.catch(() => null);

        if (newContext) {
            this.contextInstances.push(newContext);
        }

        this.contextCreatePromises.delete(promiseKey);
        return newContext;
    }

    private createPromise(
        contextId: string, objectType: KIXObjectType | string, contextMode: ContextMode, objectId?: string | number
    ): Promise<Context> {
        return new Promise<Context>(async (resolve, reject) => {
            const descriptor = this.registeredDescriptors.find(
                (cd) => this.isContext(contextId, cd, objectType, contextMode)
            );

            let context: Context;
            if (descriptor) {
                const allowed = await AuthenticationSocketClient.getInstance().checkPermissions(descriptor.permissions);

                if (allowed) {
                    const configuration = await ContextSocketClient.getInstance().loadContextConfiguration(
                        descriptor.contextId
                    ).catch(
                        (error) => { reject(error); }
                    );
                    if (configuration) {
                        context = new descriptor.contextClass(descriptor, objectId, configuration);
                    }
                }
            }

            resolve(context);
        });
    }

    public resetDialogContexts(): void {
        this.contextInstances.filter((c) => c.getDescriptor().contextType === ContextType.DIALOG)
            .forEach((c) => {
                const formId = c.getAdditionalInformation(AdditionalContextInformation.FORM_ID);
                if (formId) {
                    FormService.getInstance().deleteFormInstance(formId);
                }
                c.reset();
                c.resetAdditionalInformation(false);
            });
    }

    private isContext(
        contextId: string, descriptor: ContextDescriptor, objectType: KIXObjectType | string, contextMode: ContextMode
    ): boolean {
        return contextId ? descriptor.contextId === contextId :
            (descriptor.isContextFor(objectType) && descriptor.contextMode === contextMode);
    }

    private static isDescriptorForUrl(
        descriptor: ContextDescriptor, contextMode: ContextMode, contextUrl: string
    ): boolean {
        return descriptor.contextMode === contextMode && descriptor.urlPaths.some((u) => u === contextUrl);
    }

    public getContextInstances(type: ContextType, mode: ContextMode): Context[] {
        return this.contextInstances.filter(
            (c) => c.getDescriptor().contextMode === mode && c.getDescriptor().contextType === type
        );
    }

}
