import {
    ContactService, CustomerService, ServiceService, SysConfigService, TicketService, FAQService,
    GeneralCatalogService, DynamicFieldService, LinkService, CMDBService, ObjectDefinitionService,
    TextModuleService, UserService, ValidObjectService, TicketTypeService, ObjectIconService,
    TicketStateService, TicketPriorityService, ConfigItemClassService, TranslationService, ChannelService
} from "./impl";
import { SlaService } from "./impl/api/SlaService";
import { SystemAddressService } from "./impl/api/SystemAddressService";

export class CoreServiceRegistry {

    private static INSTANCE: CoreServiceRegistry;

    private constructor() { }

    private static getInstance(): CoreServiceRegistry {
        if (!CoreServiceRegistry.INSTANCE) {
            CoreServiceRegistry.INSTANCE = new CoreServiceRegistry();
        }

        return CoreServiceRegistry.INSTANCE;
    }

    private initialized: boolean = false;

    public static async registerCoreServices(): Promise<void> {
        const registry = CoreServiceRegistry.getInstance();
        if (!registry.initialized) {
            const cachePromises: Array<Promise<any>> = [];

            cachePromises.push(TranslationService.getInstance().initCache());
            cachePromises.push(ChannelService.getInstance().initCache());
            cachePromises.push(CMDBService.getInstance().initCache());
            cachePromises.push(ConfigItemClassService.getInstance().initCache());
            cachePromises.push(ContactService.getInstance().initCache());
            cachePromises.push(CustomerService.getInstance().initCache());
            cachePromises.push(DynamicFieldService.getInstance().initCache());
            cachePromises.push(FAQService.getInstance().initCache());
            cachePromises.push(GeneralCatalogService.getInstance().initCache());
            cachePromises.push(LinkService.getInstance().initCache());
            cachePromises.push(ObjectDefinitionService.getInstance().initCache());
            cachePromises.push(ServiceService.getInstance().initCache());
            cachePromises.push(SlaService.getInstance().initCache());
            cachePromises.push(SysConfigService.getInstance().initCache());
            cachePromises.push(TextModuleService.getInstance().initCache());
            cachePromises.push(TicketService.getInstance().initCache());
            cachePromises.push(TicketTypeService.getInstance().initCache());
            cachePromises.push(TicketPriorityService.getInstance().initCache());
            cachePromises.push(TicketStateService.getInstance().initCache());
            cachePromises.push(UserService.getInstance().initCache());
            cachePromises.push(ValidObjectService.getInstance().initCache());
            cachePromises.push(ObjectIconService.getInstance().initCache());
            cachePromises.push(SystemAddressService.getInstance().initCache());

            await Promise.all(cachePromises);

            registry.initialized = true;
        }
    }

}
