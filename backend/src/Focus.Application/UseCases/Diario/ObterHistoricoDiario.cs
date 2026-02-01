using System.Collections.Generic;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;

namespace Focus.Application.UseCases.Diario
{
    public class ObterHistoricoDiario(IRegistroDiarioRepository repository)
    {
        private readonly IRegistroDiarioRepository _repository = repository;

        public List<RegistroDiario> Executar(string usuarioId, int dias)
        {
            // Se dias for 0 ou negativo, assumimos um padrão (ex: 30 dias)
            if (dias <= 0) dias = 30;

            return _repository.BuscarHistorico(usuarioId, dias);
        }
    }
}
