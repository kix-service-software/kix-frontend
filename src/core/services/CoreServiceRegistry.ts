import {
    ContactService, OrganisationService, ServiceService, SysConfigService, TicketService, FAQService,
    GeneralCatalogService, DynamicFieldService, LinkService, CMDBService, ObjectDefinitionService,
    TextModuleService, ValidObjectService, TicketTypeService, ObjectIconService,
    TicketStateService, TicketPriorityService, ConfigItemClassService, TranslationService,
    ChannelService, TicketTemplateService, QueueService, MailAccountService, RoleService,
    SystemAddressService, SlaService, MailFilterService
} from "./impl";
import { CacheService } from "../cache";
import { UserService } from "./impl/api/UserService";

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

            await CacheService.getInstance().init();

            TranslationService.getInstance();
            ChannelService.getInstance();
            CMDBService.getInstance();
            ConfigItemClassService.getInstance();
            ContactService.getInstance();
            OrganisationService.getInstance();
            DynamicFieldService.getInstance();
            FAQService.getInstance();
            GeneralCatalogService.getInstance();
            LinkService.getInstance();
            ObjectDefinitionService.getInstance();
            ServiceService.getInstance();
            SlaService.getInstance();
            SysConfigService.getInstance();
            TextModuleService.getInstance();
            TicketService.getInstance();
            TicketTypeService.getInstance();
            TicketPriorityService.getInstance();
            TicketStateService.getInstance();
            UserService.getInstance();
            ValidObjectService.getInstance();
            ObjectIconService.getInstance();
            SystemAddressService.getInstance();
            RoleService.getInstance();
            QueueService.getInstance();
            MailAccountService.getInstance();
            MailFilterService.getInstance();
            TicketTemplateService.getInstance();

            registry.initialized = true;
        }
    }

}
