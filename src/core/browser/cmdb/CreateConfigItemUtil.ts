import { ConfigItemProperty, Version, ConfigItemImage, FormField } from "../../model";
import { FormService } from "../form";
import { BrowserUtil } from "../BrowserUtil";
import { CreateConfigItemVersionUtil } from "./CreateConfigItemVersionUtil";

export class CreateConfigItemUtil {

    public static async createParameter(formId: string, classId: number): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];

        const version = new Version();
        let images: ConfigItemImage[] = [];

        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const form = formInstance.getForm();

        let fields: FormField[] = [];
        form.groups.forEach((g) => fields = [...fields, ...g.formFields]);

        for (const formField of fields) {
            const property = formField.property;
            const formValue = formInstance.getFormFieldValue(formField.instanceId);
            const value = formValue ? formValue.value : null;
            switch (property) {
                case ConfigItemProperty.IMAGES:
                    if (value) {
                        images = await CreateConfigItemUtil.prepareImages(value as File[]);
                    }
                    break;
                case ConfigItemProperty.LINKS:
                    parameter.push([property, value]);
                    break;
                default:
            }
        }

        const versionParameter = await CreateConfigItemVersionUtil.createParameter(formId);
        versionParameter.forEach((p) => {
            version[p[0]] = p[1];
        });
        parameter.push([ConfigItemProperty.VERSION, version]);
        parameter.push([ConfigItemProperty.CLASS_ID, classId]);
        if (!!images.length) {
            parameter.push([ConfigItemProperty.IMAGES, images]);
        }

        return parameter;
    }

    private static async prepareImages(files: File[]): Promise<ConfigItemImage[]> {
        const images = [];
        for (const f of files) {
            if (f && f.name) {
                const image = new ConfigItemImage();
                image.Filename = f.name;
                image.Content = await BrowserUtil.readFile(f);
                image.ContentType = f.type;
                images.push(image);
            }
        }
        return images;
    }
}
