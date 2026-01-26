using Focus.Domain.Entities;

namespace Focus.Domain.Repositories
{
    public interface IUserRepository
    {

        void Adicionar(UsuarioTDAH usuario);


        bool ExisteEmail(string email);
    }
}