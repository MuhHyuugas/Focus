using System;
using System.Collections.Generic;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;

namespace Focus.Application.UseCases.Tratamentos
{
    public class CriarTratamento(
        IMedicacaoRepository medicacaoRepository,
        ITratamentoRepository tratamentoRepository,
        ILembreteRepository lembreteRepository)
    {
        private readonly IMedicacaoRepository _medicacaoRepository = medicacaoRepository;
        private readonly ITratamentoRepository _tratamentoRepository = tratamentoRepository;
        private readonly ILembreteRepository _lembreteRepository = lembreteRepository;

        public void Executar(string usuarioId, string nomeMedicamento, string dosagem, DateTime horarioInicio, int intervaloHoras)
        {
            // 1. Verifica/Cria Medicamento
            var medicacao = _medicacaoRepository.BuscarPorNome(nomeMedicamento);
            if (medicacao == null)
            {
                medicacao = new Medicacao(nomeMedicamento, dosagem);
                _medicacaoRepository.Adicionar(medicacao);
            }

            // 2. Cria Tratamento
            var tratamento = new Tratamento(usuarioId, medicacao.Id, horarioInicio, dosagem, intervaloHoras);
            _tratamentoRepository.Adicionar(tratamento);

            // 3. Gera Lembretes para 7 dias
            var dataAtual = horarioInicio;
            var dataLimite = horarioInicio.AddDays(7);
            var lembretes = new List<Lembrete>();

            while (dataAtual < dataLimite)
            {
                var lembrete = new Lembrete(tratamento.Id, dataAtual);
                lembretes.Add(lembrete);
                dataAtual = dataAtual.AddHours(intervaloHoras);
            }

            _lembreteRepository.AdicionarRange(lembretes);
        }
    }
}
