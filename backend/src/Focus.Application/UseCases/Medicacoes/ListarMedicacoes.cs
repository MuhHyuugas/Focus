using Focus.Domain.Entities;
using Focus.Domain.Repositories;
using System.Collections.Generic;

namespace Focus.Application.UseCases.Medicacoes
{
    public class ListarMedicacoes(IMedicacaoRepository repository)
    {
        private readonly IMedicacaoRepository _repository = repository;

        public IEnumerable<Medicacao> Executar()
        {
            return _repository.ListarTodos();
        }
    }
}
