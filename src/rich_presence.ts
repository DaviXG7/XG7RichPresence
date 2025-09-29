import {Client, SetActivity} from "@xhayper/discord-rpc";

//1167899920334868540

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
            startTimestamp: new Date(),
            endTimestamp: new Date(),
            largeImageKey: "",
            largeImageText: "",
            buttons: [
                {label: "", url: ""},
                {label: "", url: ""}
            ],
        };

    }

    setActivity(activity: SetActivity) {
        this.activity = activity;
        if (this.client) this.client.user?.setActivity(this.activity);

    }

    login(clientID: string) {

        if (!this.client) {
            this.client = new Client({ clientId: clientID })
        }

        this.client.on("ready", () => {
            this.setActivity(this.activity);
        })

        this.client.login().catch(console.error);

    }



}