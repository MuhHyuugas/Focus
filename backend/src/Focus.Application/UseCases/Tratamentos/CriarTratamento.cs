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

            // 2. Verifica se é atualização ou criação
            if (!string.IsNullOrEmpty(id) && Guid.TryParse(id, out var treatmentGuid))
            {
                var tratamentoExistente = _tratamentoRepository.ObterPorId(treatmentGuid);
                if (tratamentoExistente != null)
                {
                    // Atualiza
                    tratamentoExistente.MedicacaoId = medicacao.Id;
                    tratamentoExistente.Dose = dose;
                    tratamentoExistente.Dias = dias;
                    tratamentoExistente.Horarios = horarios;
                    tratamentoExistente.UpdatedAt = DateTime.UtcNow;
                    
                    _tratamentoRepository.Atualizar(tratamentoExistente);
                    return tratamentoExistente;
                }
            }

            if (!Guid.TryParse(usuarioId, out var usuarioGuid))
            {
                throw new ArgumentException("ID do usuário inválido");
            }

            // Apenas para CRIAR novo tratamento, desativamos os anteriores? 
            // O requisito diz que o app quer ter "um medicamento ativo". 
            // Se estamos criando um novo, faz sentido desativar os outros.
            _tratamentoRepository.DesativarTratamentosAtivos(usuarioGuid);

            var novoTratamento = new Tratamento(usuarioGuid, medicacao.Id, dose, dias, horarios);
            // Se o ID vier e não existir, ignoramos e criamos novo UUID (padrão do construtor) ou forçamos? 
            // O construtor suporta ID opcional. Se o cliente mandou ID e não achou, talvez fosse melhor criar com aquele ID?
            // Mas UUID gerado pelo cliente pode ser perigoso se colidir. Vamos deixar gerar novo.
            
            _tratamentoRepository.Adicionar(novoTratamento);

            return novoTratamento;
        }
    }
}
