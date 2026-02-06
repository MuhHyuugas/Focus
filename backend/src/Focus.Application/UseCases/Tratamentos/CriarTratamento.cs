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

        public void Executar(string usuarioId, string nomeMedicamento, string dose, string dias, string horarios)
        {
            // 1. Verifica/Cria Medicamento
            var medicacao = _medicacaoRepository.BuscarPorNome(nomeMedicamento);
            if (medicacao == null)
            {
                medicacao = new Medicacao(nomeMedicamento, null); // DosagemPadrao optional
                _medicacaoRepository.Adicionar(medicacao);
            }

            // 2. Cria Tratamento
            if (!Guid.TryParse(usuarioId, out var usuarioGuid))
            {
                throw new ArgumentException("ID do usuário inválido");
            }

            var tratamento = new Tratamento(usuarioGuid, medicacao.Id, dose, dias, horarios);
            _tratamentoRepository.Adicionar(tratamento);

            // 3. (Removido) Lembretes são gerenciados localmente pelo App Mobile
        }
    }
}
