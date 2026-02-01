using System;
using Focus.Domain.Repositories;

namespace Focus.Application.UseCases.Tratamentos
{
    public class MarcarLembreteComoTomado(ILembreteRepository repository)
    {
        private readonly ILembreteRepository _repository = repository;

        public void Executar(Guid lembreteId)
        {
            var lembrete = _repository.BuscarPorId(lembreteId)
                           ?? throw new Exception("Lembrete não encontrado.");

            lembrete.MarcarComoTomado(DateTime.Now);

            _repository.Atualizar(lembrete);
        }
    }
}
