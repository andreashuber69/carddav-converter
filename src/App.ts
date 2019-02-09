import * as dav from "dav";
import { AddressParser, IAddress } from "./AddressParser";

class App {
    public static async main() {
        try {
            const xhr = new dav.transport.Basic(
                new dav.Credentials({
                    username: "test",
                    password: "test",
                }),
            );

            const client = new dav.Client(xhr);
            const { addressBooks } = await client.createAccount({
                server: "http://192.168.178.36/owncloud/remote.php/dav/",
                // cSpell: ignore carddav
                accountType: "carddav",
            });

            if (!addressBooks || !addressBooks.length) {
                return 1;
            }

            const addressBook = addressBooks[0];

            // await this.addToOwnCloud(
            //     client,
            //     addressBook,
            //     await AddressParser.parse("/home/andreas/git/addresses-ruth/yahoo_contacts.csv"));

            const { objects } = await dav.syncAddressBook(addressBook, { xhr });

            for (const card of objects) {
                console.log(card.addressData);
            }

            return 0;
        } catch (e) {
            console.log(e);

            return 1;
        }
    }

    private static async addToOwnCloud(client: dav.Client, addressBook: dav.AddressBook, addresses: IAddress[]) {
        for (let index = 0; index < addresses.length; ++index) {
            const data = this.createCard(addresses[index]);
            await client.createCard(addressBook, { data, filename: `${index}.vcf`});
        }
    }

    private static createCard({
        First,
        Last,
        Category,
        Home,
        Work,
        Mobile,
        Email,
        "Alternate Email 1": workEmail,
        "Alternate Email 2": alternateHomeEmail,
        "Home Address": homeAddress,
    }: IAddress) {
        return [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${[ First, Last ].filter((name) => !!name).join(" ")}`,
            `N:${Last};${First};;;`,
            Category && `CATEGORIES:${Category}`,
            Email && `EMAIL;TYPE=HOME:${Email}`,
            alternateHomeEmail && `EMAIL;TYPE=HOME:${alternateHomeEmail}`,
            workEmail && `EMAIL;TYPE=HOME:${workEmail}`,
            Mobile && `TEL;TYPE=CELL:${Mobile}`,
            Home && `TEL;TYPE=HOME,VOICE:${Home}`,
            Work && `TEL;TYPE=WORK,VOICE:${Work}`,
            homeAddress && `ADR;TYPE=;;${homeAddress};;;;`,
            "END:VCARD",
        ].filter((line) => !!line).join("\n");
    }
}

// The catch should never be reached (because we handle all errors in main). If it does, we let the whole thing fail.
App.main().then((exitCode) => process.exitCode = exitCode).catch((reason) => process.exitCode = 1);
