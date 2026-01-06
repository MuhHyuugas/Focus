using Focus.Domain.Entities; 

namespace Focus.Domain.Repositories
{
    public interface IUserRepository
    {
      
        void Adicionar(UsuarioTDAH usuario);

    
        UsuarioTDAH? ObterPorEmail(string email);
    }
}