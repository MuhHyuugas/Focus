using System;
using Focus.Domain.Enums;

namespace Focus.Domain.Entities
{
    public class Tratamento
    {
        public Guid Id { get; set; }
        public string UsuarioId { get; set; } // FK para UsuarioTDAH (string)
        public UsuarioTDAH Usuario { get; set; } = null!;

        public Guid MedicacaoId { get; set; } // FK para Medicacao (Guid)
        public Medicacao Medicacao { get; set; } = null!;

        public DateTime DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        public string DosagemPersonalizada { get; set; } = string.Empty;
        public int IntervaloHoras { get; set; }
        public StatusTratamento Status { get; set; }

        public Tratamento(string usuarioId, Guid medicacaoId, DateTime dataInicio, string dosagemPersonalizada, int intervaloHoras)
        {
            Id = Guid.NewGuid();
            UsuarioId = usuarioId;
            MedicacaoId = medicacaoId;
            DataInicio = dataInicio;
            DosagemPersonalizada = dosagemPersonalizada;
            IntervaloHoras = intervaloHoras;
            Status = StatusTratamento.Ativo;
        }

        // Construtor vazio para o EF Core
        protected Tratamento() { }

        public void Finalizar(DateTime dataFim)
        {
            DataFim = dataFim;
            Status = StatusTratamento.Finalizado;
        }
    }
}
