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
            if (!Guid.TryParse(usuarioId, out var usuarioGuid))
                throw new ArgumentException("ID do usuário inválido");

            var hoje = DateTime.Today;
            var registroExistente = _repository.BuscarPorUsuarioEData(usuarioGuid, hoje);

            if (registroExistente != null)
            {
                registroExistente.Atualizar(humor, nivelFoco, ansiedade, observacoes);
                _repository.Atualizar(registroExistente);
            }
            else
            {
                var novoRegistro = new RegistroDiario(usuarioGuid, hoje, humor, nivelFoco, ansiedade, observacoes);
                _repository.Adicionar(novoRegistro);
            }
        }
    }
}
