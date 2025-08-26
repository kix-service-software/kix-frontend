import { ExtendedInitialSiteURLNodesService } from '../../base-components/webapp/core/ExtendedInitialSiteURLNodesService';
import { TreeNode } from '../../base-components/webapp/core/tree';

export class PersonalSettingsService {

    private static INSTANCE: PersonalSettingsService;

    private registeredInitialURLSiteExtendedServices: ExtendedInitialSiteURLNodesService[] = [];

    public static getInstance(): PersonalSettingsService {
        if (!PersonalSettingsService.INSTANCE) {
            PersonalSettingsService.INSTANCE = new PersonalSettingsService();
        }
        return PersonalSettingsService.INSTANCE;
    }

    public registerInitialURLSiteExtendedService(service: ExtendedInitialSiteURLNodesService): void {
        this.registeredInitialURLSiteExtendedServices.push(service);
    }

    public static async getInitialURLSiteNodes(): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];
        for (let service of this.getInstance().registeredInitialURLSiteExtendedServices) {
            let serviceNodes = await service.getInitialSiteURLNodes() || [];
            serviceNodes = serviceNodes.filter((sn) => !nodes.some((n) => n.id === sn.id));
            nodes.push(...serviceNodes);
        }

        const homeNode = nodes.find((n) => n.id === 'home');
        if (homeNode) {
            homeNode.selected = true;
        }

        return nodes;
    }
}