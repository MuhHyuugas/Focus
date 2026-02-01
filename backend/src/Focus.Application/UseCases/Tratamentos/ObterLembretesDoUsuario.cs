using System;
using System.Collections.Generic;
using System.Linq;
using Focus.Domain.Repositories;

namespace Focus.Application.UseCases.Tratamentos
{
    public class ObterLembretesDoUsuario(ILembreteRepository repository)
    {
        private readonly ILembreteRepository _repository = repository;

        public List<LembreteDto> Executar(string usuarioId, DateTime? data = null)
        {
            var dataFiltro = data ?? DateTime.Today;

            var lembretes = _repository.BuscarPorUsuarioEData(usuarioId, dataFiltro);

            return lembretes.Select(l => new LembreteDto(
                l.Id,
                l.Tratamento.Medicacao.Nome,
                l.Tratamento.DosagemPersonalizada,
                l.DataHoraPrevista,
                l.Status.ToString()
            )).ToList();
        }
    }

    public record LembreteDto(
        Guid Id,
        string NomeMedicamento,
        string Dosagem,
        DateTime Horario,
        string Status
    );
}
