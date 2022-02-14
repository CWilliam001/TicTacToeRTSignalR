using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

    // ============================================================================================
    // Class: Player
    // ============================================================================================
    
    //ID, Name, Score??

    public class Player
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public int Count { get; set; } = 0;

        public Player(string id, string name) => (Id, Name) = (id, name);
        
    }



    // ============================================================================================
    // Class: Game
    // ============================================================================================
    
    //ID, P1, P2

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
    }
