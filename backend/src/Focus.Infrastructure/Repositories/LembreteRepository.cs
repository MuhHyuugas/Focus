using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;
using Focus.Infrastructure.Data;

namespace Focus.Infrastructure.Repositories
{
    public class LembreteRepository(AppDbContext context) : ILembreteRepository
    {
        private readonly AppDbContext _context = context;

        public void Adicionar(Lembrete lembrete)
        {
            _context.Lembretes.Add(lembrete);
            _context.SaveChanges();
        }

        public void AdicionarRange(IEnumerable<Lembrete> lembretes)
        {
            _context.Lembretes.AddRange(lembretes);
            _context.SaveChanges();
        }

        public List<Lembrete> BuscarPorUsuarioEData(string usuarioId, DateTime data)
        {
            return _context.Lembretes
                .Include(l => l.Tratamento)
                .ThenInclude(t => t.Medicacao)
                .Where(l => l.Tratamento.UsuarioId == usuarioId && l.DataHoraPrevista.Date == data.Date)
                .OrderBy(l => l.DataHoraPrevista)
                .ToList();
        }

        public Lembrete? BuscarPorId(Guid id)
        {
            return _context.Lembretes
                .Include(l => l.Tratamento)
                .FirstOrDefault(l => l.Id == id);
        }

        public void Atualizar(Lembrete lembrete)
        {
            _context.Lembretes.Update(lembrete);
            _context.SaveChanges();
        }
    }
}
