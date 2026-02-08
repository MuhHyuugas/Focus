using Focus.Domain.Entities;
using Focus.Domain.Repositories;
using Focus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Focus.Infrastructure.Repositories
{
    public class SideEffectRepository(AppDbContext context) : ISideEffectRepository
    {
        private readonly AppDbContext _context = context;

        public void Adicionar(SideEffect sideEffect)
        {
            _context.SideEffects.Add(sideEffect);
            _context.SaveChanges();
        }

        public IEnumerable<SideEffect> ListarPorUsuario(Guid usuarioId)
        {
            return _context.SideEffects
                .Include(s => s.Tratamento)
                .Where(s => s.Tratamento.UsuarioId == usuarioId)
                .OrderByDescending(s => s.Data)
                .ToList();
        }

        public void Remover(Guid id)
        {
            var sideEffect = _context.SideEffects.Find(id);
            if (sideEffect != null)
            {
                _context.SideEffects.Remove(sideEffect);
                _context.SaveChanges();
            }
        }
    }
}
