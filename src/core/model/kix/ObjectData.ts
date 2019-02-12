import {
    Service, User, KIXObjectType, ValidObject
} from '.';
import { Form, FormContext } from '..';
import { ObjectDefinition } from './object-definition/ObjectDefinition';
import { Bookmark } from '../components';
import { ReleaseInfo } from '../ReleaseInfo';

export class ObjectData {

    public constructor(
        public services: Service[] = [],
        public servicesHierarchy: Service[] = [],
        public users: User[] = [],
        public currentUser: User = null,
        public validObjects: ValidObject[] = [],
        public contactAttributes: Array<[string, string]> = [],
        public customerAttributes: Array<[string, string]> = [],
        public faqVisibilities: Array<[string, string]> = [],
        public objectDefinitions: ObjectDefinition[] = [],
        public bookmarks: Bookmark[] = [],
        public releaseInfo: ReleaseInfo = null,
        public socketTimeout: number = 30000
    ) { }

}
