// tslint:disable-next-line:no-var-requires no-require-imports
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
            const account = await client.createAccount({
                server: "http://192.168.178.36/owncloud/remote.php/dav/",
                // cSpell: ignore carddav
                accountType: "carddav",
            });

            return 0;
        } catch (e) {
            console.log(e);

            return 1;
        }
    }
}

// The catch should never be reached (because we handle all errors in main). If it does, we let the whole thing fail.
App.main().then((exitCode) => process.exitCode = exitCode).catch((reason) => process.exitCode = 1);
