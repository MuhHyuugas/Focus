using Focus.Domain.Entities;

namespace Focus.Domain.Security
{
    public interface ITokenGenerator
    {
        string Generate(UsuarioTDAH usuario);
    }
}
