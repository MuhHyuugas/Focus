using System;
using Focus.Domain.Entities;
using Focus.Domain.Enums;
using Focus.Domain.Repositories;

namespace Focus.Application.UseCases.Diario
{
    public class RegistrarDiario(IRegistroDiarioRepository repository)
    {
        private readonly IRegistroDiarioRepository _repository = repository;

        public void Executar(string usuarioId, Humor humor, int nivelFoco, bool ansiedade, string? observacoes)
        {
            var hoje = DateTime.Today;
            var registroExistente = _repository.BuscarPorUsuarioEData(usuarioId, hoje);

            if (registroExistente != null)
            {
                registroExistente.Atualizar(humor, nivelFoco, ansiedade, observacoes);
                _repository.Atualizar(registroExistente);
            }
            else
            {
                var novoRegistro = new RegistroDiario(usuarioId, hoje, humor, nivelFoco, ansiedade, observacoes);
                _repository.Adicionar(novoRegistro);
            }
        }
    }
}
