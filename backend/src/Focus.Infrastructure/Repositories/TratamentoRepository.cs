using System.Collections.Generic;
using System.Linq;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;
using Focus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Focus.Infrastructure.Repositories
{
    public class TratamentoRepository(AppDbContext context) : ITratamentoRepository
    {
        private readonly AppDbContext _context = context;

        public void Adicionar(Tratamento tratamento)
        {
            _context.Tratamentos.Add(tratamento);
            _context.SaveChanges();
        }

        public void Atualizar(Tratamento tratamento)
        {
            _context.Tratamentos.Update(tratamento);
            _context.SaveChanges();
        }

        public Tratamento? ObterPorId(Guid id)
        {
            return _context.Tratamentos
                .Include(t => t.Medicacao)
                .FirstOrDefault(t => t.Id == id);
        }

        public List<Tratamento> BuscarPorUsuario(Guid usuarioId)
        {
            return _context.Tratamentos
                .Include(t => t.Medicacao)
                .Where(t => t.UsuarioId == usuarioId)
                .ToList();
        }

        public void DesativarTratamentosAtivos(Guid usuarioId)
        {
            var ativos = _context.Tratamentos
                .Where(t => t.UsuarioId == usuarioId && t.Status == "ativo")
                .ToList();

            foreach (var t in ativos)
            {
                t.Status = "inativo";
                t.UpdatedAt = DateTime.UtcNow;
            }

            _context.SaveChanges();
        }
    }
}
