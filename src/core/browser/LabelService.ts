import { ILabelProvider } from ".";
import { ObjectIcon, KIXObjectType, KIXObject } from "../model";

export class LabelService {

    private static INSTANCE: LabelService;

    public static getInstance(): LabelService {
        if (!LabelService.INSTANCE) {
            LabelService.INSTANCE = new LabelService();
        }
        return LabelService.INSTANCE;
    }

    private constructor() { }

    private labelProviders: Array<ILabelProvider<any>> = [];

    public registerLabelProvider<T>(labelProvider: ILabelProvider<T>): void {
        this.labelProviders.push(labelProvider);
    }

    public getIcon<T extends KIXObject>(object: T): string | ObjectIcon {
        const labelProvider = this.getLabelProvider(object);
        if (labelProvider) {
            return labelProvider.getObjectIcon(object);
        }
        return null;
    }

    public async getText<T extends KIXObject>(object: T, id?: boolean, title?: boolean): Promise<string> {
        const labelProvider = this.getLabelProvider(object);
        if (labelProvider) {
            return await labelProvider.getObjectText(object, id, title);
        }
        return null;
    }

    public getAdditionalText<T extends KIXObject>(object: T): string {
        const labelProvider = this.getLabelProvider(object);
        if (labelProvider) {
            return labelProvider.getObjectAdditionalText(object);
        }
        return null;
    }

    public async getObjectName(objectType: KIXObjectType, plural: boolean = false): Promise<string> {
        const labelProvider = this.getLabelProviderForType(objectType);
        if (labelProvider) {
            return await labelProvider.getObjectName(plural);
        }
        return objectType;
    }

    public getTooltip<T extends KIXObject>(object: T): string {
        const labelProvider = this.getLabelProvider(object);
        if (labelProvider) {
            return labelProvider.getObjectTooltip(object);
        }
        return null;
    }

    public async getPropertyText(
        property: string, objectType: KIXObjectType, short: boolean = false, translatable: boolean = true
    ): Promise<string> {
        const labelProvider = this.getLabelProviderForType(objectType);
        if (labelProvider) {
            return await labelProvider.getPropertyText(property, short, true);
        }
        return null;
    }

    public async getPropertyIcon(property: string, objectType: KIXObjectType): Promise<string | ObjectIcon> {
        const labelProvider = this.getLabelProviderForType(objectType);
        if (labelProvider) {
            return await labelProvider.getPropertyIcon(property);
        }
        return null;
    }

    public async getPropertyValueDisplayText<T extends KIXObject>(
        object: T, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        const labelProvider = this.getLabelProvider(object);
        if (labelProvider) {
            return await labelProvider.getDisplayText(object, property, defaultValue, translatable);
        }
        return null;
    }

    public async getPropertyValueDisplayIcons<T extends KIXObject>(
        object: T,
        property: string
    ): Promise<Array<string | ObjectIcon>> {
        const labelProvider = this.getLabelProvider(object);
        if (labelProvider) {
            return await labelProvider.getIcons(object, property);
        }
        return null;
    }

    public getLabelProvider<T extends KIXObject>(object: T): ILabelProvider<T> {
        return this.labelProviders.find((lp) => lp.isLabelProviderFor(object));
    }

    public getLabelProviderForType<T extends KIXObject>(objectType: KIXObjectType): ILabelProvider<T> {
        return this.labelProviders.find((lp) => lp.kixObjectType === objectType);
    }

}
