
const now = () => new Date().getTime();

export class DiscordRpcManager {
    ws: WebSocket;
    activity: any;
    lobby: any;
    isReady: boolean;
    constructor(ws: WebSocket) {
        this.activity = {
            details: 'Ready to play',
            state: 'In launcher',
            startTimestamp: now(),
            largeImageKey: 'launcher_icon',
            largeImageText: 'Croissant Launcher',
            smallImageText: 'Ready to play',
            instance: true,
        };
        this.lobby = null;
        this.isReady = false;
        this.ws = ws;

        setInterval(() => {
            if(ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ action: "setActivity", activity: this.activity }));
            }
        }, 3000);
    }

    setActivity(activity, initialize = false) {
        this.activity = { ...this.activity, ...activity };
    }

    createLobby(lobbyInfo) {
        this.lobby = lobbyInfo;
        console.log("Creating lobby:", lobbyInfo);
        this.setActivity({
            ...this.activity,
            partyId: lobbyInfo.id,
            partySize: lobbyInfo.size,
            partyMax: lobbyInfo.max,
            joinSecret: lobbyInfo.joinSecret,
        });
    }

    updateLobby(lobbyInfo) {
        this.lobby = { ...this.lobby, ...lobbyInfo };
        this.setActivity({
            ...this.activity,
            partySize: this.lobby.size,
            partyMax: this.lobby.max,
        });
    }

    clearLobby() {
        this.lobby = null;
        this.setActivity({ ...this.activity, partyId: undefined, joinSecret: undefined, partySize: undefined, partyMax: undefined });
    }

    updateState(state) {
        if (this.activity) {
            this.setActivity({
                ...this.activity,
                state,
            });
        }
    }
}
