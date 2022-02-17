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
        public int Count { get; set; } = 0;

        public Player(string id, string name) => (Id, Name) = (id, name);
        
    }

    // ============================================================================================
    // Class: Game
    // ============================================================================================

    public class Game
    {
        public string Id { get; set; }
        public Player P1 { get; set; }
        public Player P2 { get; set; }
        
        public bool IsWaiting { get; set; }
        
        public bool IsEmpty => P1 == null && P2 == null;
        public bool IsFull => P1 != null && P2 != null;

        public string AddPlayer(Player player)
        {
            if (P1 == null)
            {
                P1 = player;
                IsWaiting = true;
                return "P1";
            } else if (P2 == null)
            {
                P2 = player;
                IsWaiting = false;
                return "P2";
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

        private static List<Game> games = new  List<Game>()
        {
            //This is the empty list that store the list of the player details
        };

        public string CreateRoom()
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
            var list = games.FindAll(games => games.IsWaiting);

            if (id == null)
            {
                await Clients.All.SendAsync("UpdateList", list);
            } else {
                await Clients.Client(id).SendAsync("UpdateList", list);
            }
        }

        // ----------------------------------------------------------------------------------------
        // Connected
        // ----------------------------------------------------------------------------------------
        
        public async Task OnConnectedAsync()
        {
            string  page = Context.GetHttpContext().Request.Query["page"];

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
            string id = Context.ConnectionId;
            string icon = Context.GetHttpContext().Request.Query["icon"];
            string name = Context.GetHttpContext().Request.Query["name"];
            string gameId = Context.GetHttpContext().Request.Query["gameId"];

            Game game = games.Find(g => g.Id == gameId);

            if (game == null || game.IsFull)
            {
                await Clients.Caller.SendAsync("Reject");
                return;
            }

            Player p = new Player(id, name);
            string letter =  game.AddPlayer(p);
            await Groups.AddToGroupAsync(id, gameId);
            await Clients.Group(gameId).SendAsync("Ready", letter, game);
            await UpdateList();
        }
    }
}