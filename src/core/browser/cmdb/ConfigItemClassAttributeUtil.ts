import {
    ConfigItemClass, KIXObjectType, AttributeDefinition,
    KIXObjectLoadingOptions, ConfigItemClassProperty, InputDefinition, DataType
} from "../../model";
import { KIXObjectService } from "../kix";

export class ConfigItemClassAttributeUtil {


    public static async getMergedClassAttributeIds(classIds?: number | number[]): Promise<Array<[string, string]>> {
        const attributes = await this.getAttributeDefinitions(classIds);
        const result: Array<[string, string]> = [];
        attributes.filter((a) => a.Input.Type !== 'Attachment' && a.Searchable)
            .forEach((a) => result.push([a.Key, a.Name]));
        return result;
    }

    public static async getAttributeType(property: string, classIds?: number | number[]): Promise<string> {
        const ciClasses = await this.loadCIClasses(classIds);
        if (ciClasses && ciClasses.length) {
            const attribute = this.getAttribute(ciClasses[0].CurrentDefinition.Definition, property);
            if (attribute && attribute.Input) {
                return attribute.Input.Type;
            }
        }

        return DataType.STRING;
    }

    public static async getAttributePath(property: string, classIds?: number | number[]): Promise<string> {
        const ciClasses = await this.loadCIClasses(classIds);
        if (ciClasses && ciClasses.length) {
            const path = this.getPath(ciClasses[0].CurrentDefinition.Definition, property);
            return path;
        }

        return null;
    }

    public static async getAttributeDefinitions(classIds?: number | number[]): Promise<AttributeDefinition[]> {
        let attributes;
        const ciClasses = await this.loadCIClasses(classIds);
        if (ciClasses && ciClasses.length) {
            if (ciClasses[0].CurrentDefinition) {
                attributes = ciClasses[0].CurrentDefinition.Definition.map((d) => new AttributeDefinition(d));
                if (ciClasses.length > 1) {
                    for (let i = 1; i < ciClasses.length; i++) {
                        const definition = ciClasses[i].CurrentDefinition;
                        if (definition && definition.Definition) {
                            this.compareTrees(attributes, definition.Definition);
                        }
                    }
                }
            }
        }

        return attributes ? this.getFlatAttributeList(attributes) : [];
    }

    private static getPath(attributes: AttributeDefinition[], key: string, parent: string = ''): string {
        for (const attribute of attributes) {
            if (attribute.Key === key) {
                return `${parent}.${attribute.Key}`;
            }

            if (attribute.Sub) {
                const path = this.getPath(attribute.Sub, key, attribute.Key);
                if (path) {
                    return parent ? `${parent}.${path}` : path;
                }
            }
        }
        return null;
    }

    public static async getAttributeInput(property: string, classIds?: number | number[]): Promise<InputDefinition> {
        const ciClasses = await this.loadCIClasses(classIds);
        if (ciClasses && ciClasses.length) {
            const attribute = this.getAttribute(ciClasses[0].CurrentDefinition.Definition, property);
            if (attribute && attribute.Input) {
                return attribute.Input;
            }
        }

        return undefined;
    }

    private static async loadCIClasses(classIds?: number | number[]): Promise<ConfigItemClass[]> {
        let objectIds: number[];
        if (classIds) {
            if (Array.isArray(classIds)) {
                objectIds = classIds.length > 0 ? classIds : null;
            } else {
                objectIds = [classIds];
            }
        }

        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, null, null, [ConfigItemClassProperty.CURRENT_DEFINITION]
        );

        const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
            KIXObjectType.CONFIG_ITEM_CLASS, objectIds, loadingOptions
        );
        return ciClasses;
    }

    private static getFlatAttributeList(tree: AttributeDefinition[]): AttributeDefinition[] {
        let attributes = tree.filter((t) => t.Input.Type !== 'Dummy');
        tree.forEach((a) => {
            if (a.Sub) {
                attributes = [...attributes, ...this.getFlatAttributeList(a.Sub)];
            }
        });
        return attributes;
    }

    public static compareTrees(
        tree1: AttributeDefinition[], tree2: AttributeDefinition[], removeKeys: boolean = true
    ): void {
        const additionalDefinitions: AttributeDefinition[] = [];
        tree1.forEach((a1) => {
            if (a1.Input && a1.Input.Type === 'Attachment') {
                additionalDefinitions.push(a1);
            } else {
                const a2 = tree2.find((a) => {
                    if (a1.Key === a.Key && (a1.Input && a.Input) && a1.Input.Type === a.Input.Type) {
                        if (a1.Input.Type === 'GeneralCatalog') {
                            return a1.Input['Class'] === a.Input['Class'];
                        } else if (a1.Input.Type === 'CIClassReference') {
                            return this.compareCIClassReferenceInputs(a1.Input, a.Input);
                        }

                        return true;
                    }
                    return false;
                });

                if (a2) {
                    if (a1.Sub && a2.Sub) {
                        this.compareTrees(a1.Sub, a2.Sub);
                    }
                } else {
                    additionalDefinitions.push(a1);
                }
            }
        });

        if (removeKeys) {
            additionalDefinitions.forEach((definition) => {
                const index = tree1.findIndex((a1) => a1.Key === definition.Key);
                if (index !== -1) {
                    tree1.splice(index, 1);
                }
            });
        } else {
            additionalDefinitions.forEach((definition) => {
                tree1.push(definition);
            });
        }

    }

    private static compareCIClassReferenceInputs(i1: InputDefinition, i2: InputDefinition): boolean {
        const classReference1 = i1['ReferencedCIClassName'];
        const classReference2 = i2['ReferencedCIClassName'];

        if (Array.isArray(classReference1) && Array.isArray(classReference2)) {
            if (classReference1.length === classReference2.length) {
                for (const reference of classReference1) {
                    if (!classReference2.some((cr) => cr === reference)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        } else if (!Array.isArray(classReference1) && !Array.isArray(classReference2)) {
            return classReference1 === classReference2;
        }

        return false;
    }

    public static getAttribute(attributes: AttributeDefinition[], key: string): AttributeDefinition {
        for (const attribute of attributes) {
            if (attribute.Key === key) {
                return attribute;
            }

            if (attribute.Sub) {
                const subAttribute = this.getAttribute(attribute.Sub, key);
                if (subAttribute) {
                    return subAttribute;
                }
            }
        }
        return null;
    }

}
