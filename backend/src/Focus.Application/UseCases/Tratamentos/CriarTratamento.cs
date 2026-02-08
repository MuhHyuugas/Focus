using System;
using System.Collections.Generic;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;

namespace Focus.Application.UseCases.Tratamentos
{
    public class CriarTratamento(
        IMedicacaoRepository medicacaoRepository,
        ITratamentoRepository tratamentoRepository)
    {
        private readonly IMedicacaoRepository _medicacaoRepository = medicacaoRepository;
        private readonly ITratamentoRepository _tratamentoRepository = tratamentoRepository;

        public Tratamento Executar(string usuarioId, string nomeMedicamento, string dose, string dias, string horarios, string? id = null)
        {
            // 1. Verifica/Cria Medicamento
            var medicacao = _medicacaoRepository.BuscarPorNome(nomeMedicamento);
            if (medicacao == null)
            {
                medicacao = new Medicacao(nomeMedicamento, null);
                _medicacaoRepository.Adicionar(medicacao);
            }

            // 2. Cria Tratamento
            if (!Guid.TryParse(usuarioId, out var usuarioGuid))
            {
                throw new ArgumentException("ID do usuário inválido");
            }

            Guid? treatmentId = null;
            if (!string.IsNullOrEmpty(id) && Guid.TryParse(id, out var guidParsed))
            {
                treatmentId = guidParsed;
            }

            var tratamento = new Tratamento(usuarioGuid, medicacao.Id, dose, dias, horarios, treatmentId);
            _tratamentoRepository.Adicionar(tratamento);

            return tratamento;
        }
    }
}
