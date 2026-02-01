using System.Linq;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;
using Focus.Infrastructure.Data;

namespace Focus.Infrastructure.Repositories
{
    public class MedicacaoRepository(AppDbContext context) : IMedicacaoRepository
    {
        private readonly AppDbContext _context = context;

        public void Adicionar(Medicacao medicacao)
        {
            _context.Medicacoes.Add(medicacao);
            _context.SaveChanges();
        }

        public Medicacao? BuscarPorNome(string nome)
        {
            return _context.Medicacoes.FirstOrDefault(m => m.Nome.ToLower() == nome.ToLower());
        }
    }
}
