import { ObjectData, AbstractAction } from "../model";

export class BaseTemplateInput {

  public constructor(
    public contextId: string,
    public objectData: ObjectData,
    public objectId: string
  ) { }
}
