using System;
using System.Collections.Generic;
using System.Linq;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;
using Focus.Infrastructure.Data;

namespace Focus.Infrastructure.Repositories
{
    public class DailyMarkRepository(AppDbContext context) : IDailyMarkRepository
    {
        private readonly AppDbContext _context = context;

        public void Adicionar(DailyMark mark)
        {
            _context.Set<DailyMark>().Add(mark);
            _context.SaveChanges();
        }

        public List<DailyMark> ListarPorUsuario(Guid usuarioId)
        {
            return _context.Set<DailyMark>()
                .Where(m => m.UsuarioId == usuarioId)
                .OrderByDescending(m => m.Data)
                .ToList();
        }

        public DailyMark? ObterPorData(Guid usuarioId, DateTime data)
        {
            var dateOnly = data.Date;
            return _context.Set<DailyMark>()
                .FirstOrDefault(m => m.UsuarioId == usuarioId && m.Data.Date == dateOnly);
        }
    }
}
