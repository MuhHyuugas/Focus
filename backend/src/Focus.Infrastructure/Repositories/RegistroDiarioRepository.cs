using System;
using System.Collections.Generic;
using System.Linq;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;
using Focus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Focus.Infrastructure.Repositories
{
    public class RegistroDiarioRepository(AppDbContext context) : IRegistroDiarioRepository
    {
        private readonly AppDbContext _context = context;

        public void Adicionar(RegistroDiario registro)
        {
            _context.Diarios.Add(registro);
            _context.SaveChanges();
        }

        public void Atualizar(RegistroDiario registro)
        {
            _context.Diarios.Update(registro);
            _context.SaveChanges();
        }

        public RegistroDiario? BuscarPorUsuarioEData(string usuarioId, DateTime data)
        {
            return _context.Diarios
                .FirstOrDefault(r => r.UsuarioId == usuarioId && r.Data.Date == data.Date);
        }

        public List<RegistroDiario> BuscarHistorico(string usuarioId, int dias)
        {
            var dataInicio = DateTime.Today.AddDays(-dias);
            return _context.Diarios
                .Where(r => r.UsuarioId == usuarioId && r.Data >= dataInicio)
                .OrderBy(r => r.Data)
                .ToList();
        }
    }
}
