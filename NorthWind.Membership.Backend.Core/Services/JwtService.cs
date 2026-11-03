using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using NorthWind.Membership.Backend.Core.Dtos;
using NorthWind.Membership.Backend.Core.Options;

namespace NorthWind.Membership.Backend.Core.Services;
internal class JwtService(IOptions<JwtOptions> options)
{
    SigningCredentials GetSigningCredentials()
    {
        var Key = Encoding.UTF8.GetBytes(options.Value.SecurityKey);
        var Secret = new SymmetricSecurityKey(Key);
        return new SigningCredentials(Secret, SecurityAlgorithms.HmacSha256);
    }
    List<Claim> GetClaims(UserDto userDto) =>
    [
        new Claim(ClaimTypes.Name, userDto.Email),
        new Claim("FullName", $"{userDto.FirstName} {userDto.LastName}")
    ];
    SecurityTokenDescriptor GetTokenDescriptor(SigningCredentials signingCredentials, List<Claim> claims) =>
        new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Issuer = options.Value.ValidIssuer,
            Audience = options.Value.ValidAudience,
            Expires = DateTime.UtcNow.AddMinutes(options.Value.ExpireInMinutes),
            SigningCredentials = signingCredentials
        };
    public string GetToken(UserDto userData)
    {
        var SigningCredentials = GetSigningCredentials();
        var Claims = GetClaims(userData);
        var TokenDescriptor = GetTokenDescriptor(SigningCredentials, Claims);
        var TokenHandler = new JsonWebTokenHandler();
        return TokenHandler.CreateToken(TokenDescriptor);
    }
}
