import {Client, SetActivity} from "@xhayper/discord-rpc";

//1167899920334868540

const now = Date.now();

export class RichPresence {

    activity: SetActivity;
    client: Client | undefined;

    constructor() {

        this.activity = {
            state: "",
            type: 0,
            partySize: 0,
            partyMax: 0,
            details: "",
            startTimestamp: now,
            largeImageKey: "",
            largeImageText: "",
            buttons: [ ],
        };

    }

    setActivity(activity: SetActivity) {
        this.activity = activity;
        if (this.client) this.client.user?.setActivity(this.activity);

    }

    login(clientID: string) {

        this.disconnect()

        console.log("LOGIN")

        this.client = new Client({ clientId: clientID.trim() })

        this.client.on("ready", () => {
            this.setActivity(this.activity);
        })

        this.client.login().catch(console.error);

    }

    disconnect() {

        console.log("DISCONNECT")

        if (this.client) {
            this.client.destroy().then(r => "destroyed");
            this.client = undefined;
        }
    }



}