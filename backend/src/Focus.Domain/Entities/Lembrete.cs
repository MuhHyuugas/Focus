using System;
using Focus.Domain.Enums;

namespace Focus.Domain.Entities
{
    public class Lembrete
    {
        public Guid Id { get; set; }

        public Guid TratamentoId { get; set; }
        public Tratamento Tratamento { get; set; } = null!;

        public DateTime DataHoraPrevista { get; set; }
        public DateTime? DataHoraTomou { get; set; }
        public StatusLembrete Status { get; set; }

        public Lembrete(Guid tratamentoId, DateTime dataHoraPrevista)
        {
            Id = Guid.NewGuid();
            TratamentoId = tratamentoId;
            DataHoraPrevista = dataHoraPrevista;
            Status = StatusLembrete.Pendente;
        }

        // Construtor vazio para o EF Core
        protected Lembrete() { }

        public void MarcarComoTomado(DateTime dataHoraTomou)
        {
            DataHoraTomou = dataHoraTomou;
            Status = StatusLembrete.Tomado;
        }

        public void Adiar(DateTime novaDataHora)
        {
            Status = StatusLembrete.Adiado;
            // Lógica para criar novo lembrete ou atualizar este dependeria da regra de negócio,
            // mas aqui vamos manter o status.
        }

        public void Pular()
        {
            Status = StatusLembrete.Pulado;
        }
    }
}
