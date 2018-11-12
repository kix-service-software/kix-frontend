import { KIXCommunicator } from "./KIXCommunicator";
import { Socket } from "socket.io";
import { CommunicatorResponse } from "@kix/core/dist/common";
import { KIXModulesEvent, LoadKIXModulesRequest, LoadKIXModulesResponse } from "@kix/core/dist/model";
import { KIXExtensions, IKIXModuleExtension } from "@kix/core/dist/extensions";
import { PluginService } from "../services";

export class KIXModuleCommunicator extends KIXCommunicator {

    private static INSTANCE: KIXModuleCommunicator;

    public static getInstance(): KIXModuleCommunicator {
        if (!KIXModuleCommunicator.INSTANCE) {
            KIXModuleCommunicator.INSTANCE = new KIXModuleCommunicator();
        }
        return KIXModuleCommunicator.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'kixmodules';
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(client, KIXModulesEvent.LOAD_MODULES, this.loadModules.bind(this));
    }

    private async loadModules(data: LoadKIXModulesRequest): Promise<CommunicatorResponse<LoadKIXModulesResponse>> {

        const modules = await PluginService.getInstance().getExtensions<IKIXModuleExtension>(KIXExtensions.MODULES);

        const packageJson = require('../../package.json');
        const version = packageJson.version;
        const prePath = '/@kix/frontend$' + version + '/dist/components/';

        modules.forEach((m) => m.tags.forEach((t) => t[1] = prePath + t[1]));

        const response = new CommunicatorResponse(
            KIXModulesEvent.LOAD_MODULES_FINISHED, new LoadKIXModulesResponse(data.requestId, modules)
        );

        return response;
    }

}
