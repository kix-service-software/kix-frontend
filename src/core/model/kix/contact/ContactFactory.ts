import { Contact } from './Contact';
import { ContactSource } from './ContactSource';
export class ContactFactory {

    public static create(contact: Contact, contactSource?: ContactSource): Contact {
        const newContact = new Contact(contact);

        if (contactSource) {
            ContactFactory.mapContactSource(newContact, contactSource);
        }

        return newContact;
    }

    private static mapContactSource(contact: Contact, source: ContactSource): void {
        contact.contactSourceMap = [];
        const unknownGroupAttributes: Array<[string, string]> = [];
        source.AttributeMapping.forEach((am) => {
            if (am.DisplayGroup) {
                const group = contact.contactSourceMap.find((csm) => csm[0] === am.DisplayGroup);
                if (!group) {
                    contact.contactSourceMap.push([am.DisplayGroup, [[am.Label, am.Attribute]]]);
                } else {
                    group[1].push([am.Label, am.Attribute]);
                }
            } else {
                unknownGroupAttributes.push([am.Label, am.Attribute]);
            }
        });

        if (unknownGroupAttributes.length > 0) {
            contact.contactSourceMap.push(['UNKNOWN', unknownGroupAttributes]);
        }
    }

}
