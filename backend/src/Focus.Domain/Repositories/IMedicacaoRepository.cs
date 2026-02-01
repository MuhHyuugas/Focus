using Focus.Domain.Entities;

namespace Focus.Domain.Repositories
{
    public interface IMedicacaoRepository
    {
        Medicacao? BuscarPorNome(string nome);
        void Adicionar(Medicacao medicacao);
    }
}
