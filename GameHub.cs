using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace TicTacToeRT
{

    // ============================================================================================
    // Class: Player
    // ============================================================================================
        
    public class Player
    {
        public string Id { get; set; }
        public string Name { get; set; }

        public Player(string id,  string name) => (Id, Name) = (id, name);
    }

    // ============================================================================================
    // Class: Game
    // ============================================================================================
    
    public class Game
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public Player PlayerA { get; set; }
        public Player PlayerB { get; set; }
        public bool IsWaiting { get; set; } = false;

        // Check room is full
        public bool IsEmpty => PlayerA == null && PlayerB == null;
        public bool IsFull  => PlayerA != null && PlayerB != null;

        public string AddPlayer(Player player)
        {
            if (PlayerA == null)
            {
                PlayerA = player;
                IsWaiting = true;
                return "A";
            }
            else if (PlayerB == null)
            {
                PlayerB = player;
                IsWaiting = false;
                return "B";
            }

            return null;
        }
    }
    
    // ============================================================================================
    // Class: GameHub ⭕❌
    // ============================================================================================
    
    public class GameHub : Hub
    {
        // ----------------------------------------------------------------------------------------
        // General
        // ----------------------------------------------------------------------------------------

        private static List<Game> games = new List<Game>()
        {
            // A method that store the List of games
        };

        public string Create()
        {
            var game = new Game();
            games.Add(game);
            return game.Id;
        }

        // ----------------------------------------------------------------------------------------
        // Functions
        // ----------------------------------------------------------------------------------------
 
        private async Task UpdateList(string id = null)
        {
            var list = games.FindAll(g => g.IsWaiting);

            if (id == null)
            {
                await Clients.All.SendAsync("UpdateList", list);
            }
            else
            {
                await Clients.Client(id).SendAsync("UpdateList", list);
            }
        }

        // ----------------------------------------------------------------------------------------
        // Connected
        // ----------------------------------------------------------------------------------------

        public override async Task OnConnectedAsync()
        {
            string page = Context.GetHttpContext().Request.Query["page"];

            switch (page)
            {
                case "list": await ListConnected(); break;
                case "game": await GameConnected(); break;
            }

            await base.OnConnectedAsync();
        }

        private async Task ListConnected()
        {
            string id = Context.ConnectionId;
            await UpdateList(id);
        }

        private async Task GameConnected()
        {
            string id     = Context.ConnectionId;
            string name   = Context.GetHttpContext().Request.Query["name"];
            string gameId = Context.GetHttpContext().Request.Query["gameId"];

            Game game = games.Find(g => g.Id == gameId);
            if (game == null || game.IsFull)
            {
                await Clients.Caller.SendAsync("Reject");
                return;
            }

            Player p = new Player(id, name);
            string letter = game.AddPlayer(p);
            await Groups.AddToGroupAsync(id, gameId);
            await Clients.Group(gameId).SendAsync("Ready", letter, game);
            await UpdateList();
        }

        // ----------------------------------------------------------------------------------------
        // Disconnected
        // ----------------------------------------------------------------------------------------

        public override async Task OnDisconnectedAsync(Exception exception) 
        {
            string page = Context.GetHttpContext().Request.Query["page"];

            switch (page)
            {
                case "list": ListDisconnected(); break;
                case "game": await GameDisconnected(); break;
            }

            await base.OnDisconnectedAsync(exception);
        }

        private void ListDisconnected()
        {
            // Nothing to do...
        }

        private async Task GameDisconnected()
        {
            string id     = Context.ConnectionId;
            string gameId = Context.GetHttpContext().Request.Query["gameId"];

            Game game = games.Find(g => g.Id == gameId);
            if (game == null)
            {
                await Clients.Caller.SendAsync("Reject");
                return;
            }

            if (game.PlayerA?.Id == id)
            {
                game.PlayerA = null;
                await Clients.Group(gameId).SendAsync("Left", game);
            }
            else if (game.PlayerB?.Id == id)
            {
                game.PlayerB = null;
                await Clients.Group(gameId).SendAsync("Left", game);
            }

            if (game.IsEmpty)
            {
                games.Remove(game);
                await UpdateList();
            }
        }

        // ----------------------------------------------------------------------------------------
        // Game
        // ----------------------------------------------------------------------------------------

        // ToDo: SendMove(int movePosition, string player)
        public async Task SendMove(string player, int movePosition, int occupiedCount, string gameId)
        {
            await Clients.Others.SendAsync("ReceiveMove", player, movePosition, occupiedCount, gameId);
        }

        public async Task Reset(string gameId)
        {
            await Clients.Others.SendAsync("ReceiveReset", gameId);
        }

        // End of GameHub -------------------------------------------------------------------------
    }
}