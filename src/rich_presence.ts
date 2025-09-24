import RPC, {Presence} from 'discord-rpc';

const rpc = new RPC.Client({
    transport: "ipc"
})

const clientID = "1167899920334868540"

let presence: Presence;

rpc.on('ready', async () => {
    await rpc.setActivity({

        partySize: 10,
        partyMax: 20,
        details: "Jogando Minecraft",
        state: "Explorando o Nether",
        startTimestamp: new Date(),
        largeImageKey: "large",
        largeImageText: "Minecraft Oficial",
        buttons: [
            {label: "Entrar no servidor", url: "https://discord.gg/xxxx"},
            {label: "asdasdasd no site", url: "https://meusite.com"}
        ]
    });

    console.log("Client ready!")
});

rpc.login({clientId: clientID }).catch(console.error);

rpc.login({clientId: clientID }).catch(console.error);

