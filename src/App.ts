import * as dav from "dav";

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

            if (addressBooks && (addressBooks.length > 0)) {
                const { objects } = await dav.syncAddressBook(addressBooks[0], { xhr });

                for (const card of objects) {
                    console.log(card);
                }
            }

            return 0;
        } catch (e) {
            console.log(e);

            return 1;
        }
    }
}

// The catch should never be reached (because we handle all errors in main). If it does, we let the whole thing fail.
App.main().then((exitCode) => process.exitCode = exitCode).catch((reason) => process.exitCode = 1);
