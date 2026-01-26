using Focus.Domain.Entities;
using Focus.Domain.Repositories;
using Focus.Infrastructure.Data;
using System.Linq;

namespace Focus.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public void Adicionar(UsuarioTDAH usuario)
        {
            _context.Usuarios.Add(usuario);
            _context.SaveChanges();
        }

        public bool ExisteEmail(string email)
        {
            return _context.Usuarios.Any(u => u.Email == email);
        }
    }
}