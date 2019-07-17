import { KIXObjectService } from "../kix";
import {
    SystemAddress, KIXObjectType, TreeNode, NotificationProperty, SysConfigOption, SysConfigKey,
    SortUtil, DataType, NotificationTicketNumberType
} from "../../model";

export class NotificationService extends KIXObjectService<SystemAddress> {

    private static INSTANCE: NotificationService = null;

    public static getInstance(): NotificationService {
        if (!NotificationService.INSTANCE) {
            NotificationService.INSTANCE = new NotificationService();
        }

        return NotificationService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.NOTIFICATION;
    }

    public getLinkObjectName(): string {
        return 'Notification';
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        switch (property) {
            case NotificationProperty.DATA_VISIBLE_FOR_AGENT:
            case NotificationProperty.DATA_SEND_ONCE_A_DAY:
            case NotificationProperty.DATA_SEND_DESPITE_OOO:
                value = Number(value);
                break;
            case NotificationProperty.DATA_RECIPIENT_SUBJECT:
                value = value === NotificationTicketNumberType.WITH ? 1 : 0;
                break;
            case NotificationProperty.DATA_RECIPIENT_EMAIL:
                value = Array.isArray(value) ? value.join(',') : value;
                break;
            default:
        }
        return [[property, value]];
    }

    protected async preparePredefinedValues(forUpdate: boolean): Promise<Array<[string, any]>> {
        return [
            ['Transports', ['Email']]
        ];
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        let values: TreeNode[] = [];

        switch (property) {
            case NotificationProperty.DATA_EVENTS:
                const ticketEvents = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_EVENTS], null, null, true
                ).catch((error): SysConfigOption[] => []);
                const articleEvents = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.ARTICLE_EVENTS], null, null, true
                ).catch((error): SysConfigOption[] => []);
                // TODO: add dynamic field events
                values = this.prepareEventTree(ticketEvents, articleEvents);
                break;
            default:
        }

        return values;
    }

    private prepareEventTree(ticketEvents: SysConfigOption[], articleEvents: SysConfigOption[]): TreeNode[] {
        let nodes = [];
        if (ticketEvents && ticketEvents.length) {
            nodes = ticketEvents[0].Value.map((event: string) => {
                return new TreeNode(event, event);
            });
        }
        if (articleEvents && articleEvents.length) {
            nodes = [
                ...nodes,
                ...articleEvents[0].Value.map((event: string) => {
                    return new TreeNode(event, event);
                })
            ];
        }
        return SortUtil.sortObjects(nodes, 'label', DataType.STRING);
    }
}
