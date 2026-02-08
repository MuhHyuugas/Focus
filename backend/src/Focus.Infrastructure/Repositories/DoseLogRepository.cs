using System;
using System.Collections.Generic;
using System.Linq;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;
using Focus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Focus.Infrastructure.Repositories
{
    public class DoseLogRepository(AppDbContext context) : IDoseLogRepository
    {
        private readonly AppDbContext _context = context;

        public void Adicionar(DoseLog log)
        {
            _context.Set<DoseLog>().Add(log);
            _context.SaveChanges();
        }

        public DoseLog? BuscarPorId(Guid id)
        {
            return _context.Set<DoseLog>().Find(id);
        }

        public List<DoseLog> BuscarPorTratamento(Guid tratamentoId)
        {
            return _context.Set<DoseLog>()
                .Where(l => l.TratamentoId == tratamentoId)
                .OrderByDescending(l => l.HorarioTomado)
                .ToList();
        }

        public List<DoseLog> BuscarPorUsuario(Guid usuarioId)
        {
            return _context.Set<DoseLog>()
                .Include(l => l.Tratamento)
                .Where(l => l.Tratamento.UsuarioId == usuarioId)
                .OrderByDescending(l => l.HorarioTomado)
                .ToList();
        }
    }
}
