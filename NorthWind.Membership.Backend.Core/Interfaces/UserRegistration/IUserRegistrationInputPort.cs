using NorthWind.Membership.Entities.Dtos.UserRegistration;

namespace NorthWind.Membership.Backend.Core.Interfaces.UserRegistration;
internal interface IUserRegistrationInputPort
{
    Task Handle(UserRegistrationDto userData);
}
