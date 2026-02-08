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
            // Os lembretes adicionados ao tratamento serão salvos em cascata, 
            // mas como não configuramos cascata explicita de adição na entidade (apenas navegação),
            // se adicionarmos Lembretes na lista (se existisse) funcionaria. 
            // Como vamos salvar lembretes separadamente ou via tratamento, vamos garantir que o SaveChanges persista tudo.

            _context.SaveChanges();
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
