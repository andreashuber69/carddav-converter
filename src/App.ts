import { AddressBook, Client, Credentials, transport } from "dav";
import { AddressParser, IAddress } from "./AddressParser";

class App {
    public static async main() {
        try {
            const client = new Client(new transport.Basic(new Credentials({ username: "test", password: "test" })));
            const addressBook = await App.getAddressBook(client);
            await App.deleteAllCards(client, addressBook);
            const importedAddresses =
                await AddressParser.parse("/home/andreas/git/addresses-ruth/outlook_contacts.csv");
            await this.addToOwnCloud(client, addressBook, importedAddresses);
            await App.displayAllCards(client, addressBook);

            return 0;
        } catch (e) {
            console.log(e);

            return 1;
        }
    }

    private static async deleteAllCards(client: Client, addressBook: AddressBook) {
        const { objects: cards } = await client.syncAddressBook(addressBook);

        for (const card of cards) {
            await client.deleteCard(card);
        }
    }

    private static async displayAllCards(client: Client, addressBook: AddressBook) {
        const { objects: cards } = await client.syncAddressBook(addressBook);

        for (const card of cards) {
            console.log(card.addressData);
        }
    }

    private static async getAddressBook(client: Client) {
        const server = "http://192.168.178.36/owncloud/remote.php/dav/";
        // cSpell: ignore carddav
        const { addressBooks } = await client.createAccount({ server, accountType: "carddav" });

        if (!addressBooks || !addressBooks.length) {
            throw new Error("No address books found!");
        }

        return addressBooks[0];
    }

    private static async addToOwnCloud(client: Client, addressBook: AddressBook, addresses: IAddress[]) {
        for (let index = 0; index < addresses.length; ++index) {
            const data = this.createCard(addresses[index]);
            await client.createCard(addressBook, { data, filename: `${index}.vcf`});
        }
    }

    private static createCard(address: IAddress) {
        const {
            "First Name": first,
            "Middle Name": middle,
            "Last Name": last,
            Title: title,
            "E-mail Address": homeEmail,
            "E-mail 2 Address": workEmail,
            "Home Phone": homePhone,
            "Business Phone": workPhone,
            "Mobile Phone": mobilePhone,
            "Other Phone": otherPhone,
            Company: company,
            "Business Street": workStreet,
            "Business City": workCity,
            "Business State": workState,
            "Business Postal Code": workZip,
            "Business Country/Region": workCountry,
            "Home Street": homeStreet,
            "Home City": homeCity,
            "Home State": homeState,
            "Home Postal Code": homeZip,
            "Home Country/Region": homeCountry,
            Notes: notes,
        } = address;

        return [
            // cSpell: ignore vcard
            "BEGIN:VCARD",
            "VERSION:3.0",
            (first || middle || last || title) && `N:${last};${first};${middle};${title};`,
            company && `ORG:${company}`,
            homeEmail && `EMAIL;TYPE=home:${homeEmail}`,
            workEmail && `EMAIL;TYPE=work:${workEmail}`,
            mobilePhone && `TEL;TYPE=cell:${mobilePhone}`,
            homePhone && `TEL;TYPE=home,voice:${homePhone}`,
            workPhone && `TEL;TYPE=work,voice:${workPhone}`,
            this.createAddress("home", [ homeStreet, homeCity, homeState, homeZip, homeCountry ]),
            this.createAddress("work", [ workStreet, workCity, workState, workZip, workCountry ]),
            notes && `NOTE:${notes}`,
            "END:VCARD",
        ].filter((line) => !!line).join("\n");
    }

    private static createAddress(
        type: "home" | "work",
        [ street, city, state, zip, country ]: [ string?, string?, string?, string?, string? ]) {
        return (street || city || state || zip || country) &&
            `ADR;TYPE=${type}:;;${street};${city};${state};${zip};${country}`;
    }
}

// The catch should never be reached (because we handle all errors in main). If it does, we let the whole thing fail.
App.main().then((exitCode) => process.exitCode = exitCode).catch((reason) => process.exitCode = 1);
