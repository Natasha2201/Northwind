using NorthWind.Membership.Entities.Dtos.UserLogin;

namespace NorthWind.Membership.Backend.Core.Interfaces.UserLogin;
internal interface IUserLoginInputPort
{
    Task Handle(UserCredentialsDto userData);
}
