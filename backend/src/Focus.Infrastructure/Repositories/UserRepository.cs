using System.Collections.Generic;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;

namespace Focus.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        
        private static readonly List<UsuarioTDAH> _bancoDeDadosFake = new();


        public void Adicionar(UsuarioTDAH usuario)
        {
        
            _bancoDeDadosFake.Add(usuario);
        }

       
        public UsuarioTDAH? ObterPorEmail(string email)
        {
        
            foreach (var item in _bancoDeDadosFake)
            {
                if (item.Email == email)
                {
                    return item;
                }
            }
            
        
            return null; 
        }
    }
}