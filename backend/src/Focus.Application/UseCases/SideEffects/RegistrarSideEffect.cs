using System;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;

namespace Focus.Application.UseCases.SideEffects
{
    public class RegistrarSideEffect(ISideEffectRepository sideEffectRepository)
    {
        private readonly ISideEffectRepository _sideEffectRepository = sideEffectRepository;

        public void Executar(Guid tratamentoId, string tipoId, string descricao, DateTime data, int? humor, bool ansiedade, int? foco, string? notas, Guid? id = null)
        {
            var sideEffect = new SideEffect(tratamentoId, tipoId, descricao, data, humor, ansiedade, foco, notas, id);
            _sideEffectRepository.Adicionar(sideEffect);
        }
    }
}
