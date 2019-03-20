import { KIXObjectService } from "../kix";
import {
    KIXObjectType, ConfigItemProperty, ConfigItem, VersionProperty,
    KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType,
    GeneralCatalogItem, ConfigItemImage, ConfigItemClass, TreeNode, ObjectIcon,
    KIXObject, CreateConfigItemVersionOptions
} from "../../model";
import { ContextService } from "../context";
import { ConfigItemDetailsContext } from "./context";
import { SearchOperator } from "../SearchOperator";
import { CreateConfigItemUtil } from "./CreateConfigItemUtil";
import { CreateConfigItemVersionUtil } from "./CreateConfigItemVersionUtil";

export class CMDBService extends KIXObjectService<ConfigItem | ConfigItemImage> {

    private static INSTANCE: CMDBService = null;

    public static getInstance(): CMDBService {
        if (!CMDBService.INSTANCE) {
            CMDBService.INSTANCE = new CMDBService();
        }

        return CMDBService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.CONFIG_ITEM
            || kixObjectType === KIXObjectType.CONFIG_ITEM_IMAGE
            || kixObjectType === KIXObjectType.CONFIG_ITEM_CLASS
            || kixObjectType === KIXObjectType.CONFIG_ITEM_ATTACHMENT;
    }

    public getLinkObjectName(): string {
        return 'ConfigItem';
    }

    public async createConfigItem(formId: string, classId: number): Promise<string | number> {
        const parameter = await CreateConfigItemUtil.createParameter(formId, classId);
        const configItemId = await KIXObjectService.createObject(KIXObjectType.CONFIG_ITEM, parameter);
        return configItemId;
    }

    public async createConfigItemVersion(formId: string, configItemId: number): Promise<string | number> {
        const parameter = await CreateConfigItemVersionUtil.createParameter(formId);
        const versionId = await KIXObjectService.createObject(
            KIXObjectType.CONFIG_ITEM_VERSION, parameter, new CreateConfigItemVersionOptions(configItemId)
        );
        return versionId;
    }

    public async searchConfigItemsByClass(
        ciClassNames: string[], searchValue: string, limit: number = 50
    ): Promise<ConfigItem[]> {
        const configItems = [];

        const loadingOptionsNumber = new KIXObjectLoadingOptions(null, [
            new FilterCriteria(
                ConfigItemProperty.CLASS, SearchOperator.IN,
                FilterDataType.STRING, FilterType.AND, ciClassNames
            ),
            new FilterCriteria(
                ConfigItemProperty.NUMBER, SearchOperator.CONTAINS,
                FilterDataType.STRING, FilterType.AND, searchValue
            )
        ], null, null, limit);

        const configItemsByNumber = await KIXObjectService.loadObjects<ConfigItem>(
            KIXObjectType.CONFIG_ITEM, null, loadingOptionsNumber, null, false
        );

        const loadingOptionsName = new KIXObjectLoadingOptions(null, [
            new FilterCriteria(
                ConfigItemProperty.CLASS, SearchOperator.IN,
                FilterDataType.STRING, FilterType.AND, ciClassNames
            ),
            new FilterCriteria(
                'CurrentVersion.' + VersionProperty.NAME, SearchOperator.CONTAINS,
                FilterDataType.STRING, FilterType.AND, searchValue
            )
        ], null, null, limit);

        const configItemsByName = await KIXObjectService.loadObjects<ConfigItem>(
            KIXObjectType.CONFIG_ITEM, null, loadingOptionsName, null, false
        );

        configItemsByNumber.forEach(
            (ci) => {
                if (!configItems.some((c) => c.ConfigItemID === ci.ConfigItemID)) {
                    configItems.push(ci);
                }
            });

        configItemsByName.forEach(
            (ci) => {
                if (!configItems.some((c) => c.ConfigItemID === ci.ConfigItemID)) {
                    configItems.push(ci);
                }
            });

        return configItems;
    }

    public async getDeploymentStates(): Promise<GeneralCatalogItem[]> {
        const loadingOptions = new KIXObjectLoadingOptions(null, [
            new FilterCriteria('Class', SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, 'ITSM::ConfigItem::DeploymentState'),
            new FilterCriteria('Functionality', SearchOperator.NOT_EQUALS, FilterDataType.STRING,
                FilterType.AND, 'postproductive')
        ]);

        const catalogItems = await KIXObjectService.loadObjects<GeneralCatalogItem>(
            KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions
        );

        return catalogItems;
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        let values: TreeNode[] = [];

        switch (property) {
            case ConfigItemProperty.CLASS_ID:
                const classes = await KIXObjectService.loadObjects<ConfigItemClass>(
                    KIXObjectType.CONFIG_ITEM_CLASS
                );
                values = classes ? classes.map((c) => new TreeNode(c.ID, c.Name)) : [];
                break;
            case ConfigItemProperty.CUR_INCI_STATE_ID:
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
                const classId = property === ConfigItemProperty.CUR_DEPL_STATE_ID
                    ? 'ITSM::ConfigItem::DeploymentState'
                    : 'ITSM::Core::IncidentState';
                const loadingOptions = new KIXObjectLoadingOptions(null, [new FilterCriteria(
                    'Class', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, classId
                )]);

                const items = await KIXObjectService.loadObjects<GeneralCatalogItem>(
                    KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions, null, false
                );

                items.forEach(
                    (i) => values.push(new TreeNode(
                        i.ItemID, i.Name, new ObjectIcon(KIXObjectType.GENERAL_CATALOG_ITEM, i.ItemID)
                    ))
                );
                break;
            default:
        }

        return values;
    }

    public determineDependendObjects(configItems: ConfigItem[], targetObjectType: KIXObjectType): string[] | number[] {
        let ids = [];

        if (targetObjectType === KIXObjectType.TICKET) {
            ids = this.getLinkedObjectIds(configItems, KIXObjectType.TICKET);
        } else if (targetObjectType === KIXObjectType.FAQ_ARTICLE) {
            ids = this.getLinkedObjectIds(configItems, KIXObjectType.FAQ_ARTICLE);
        } else {
            ids = super.determineDependendObjects(configItems, targetObjectType);
        }

        return ids;
    }

    public async getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string> {
        const id = object ? object.ObjectId : objectId;
        const context = await ContextService.getInstance().getContext(ConfigItemDetailsContext.CONTEXT_ID);
        return context.getDescriptor().urlPaths[0] + '/' + id;
    }

}
