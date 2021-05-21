using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Docker.Manager.Core.Hubs
{
    public class ProgressHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            var res = Context.User;
            return base.OnConnectedAsync();
        }

        public string GetConnectionID()
        {
            return Context.ConnectionId;
        }
    }
}
