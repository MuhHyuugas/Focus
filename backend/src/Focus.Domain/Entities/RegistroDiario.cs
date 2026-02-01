using System;
using Focus.Domain.Enums;

namespace Focus.Domain.Entities
{
    public class RegistroDiario
    {
        public Guid Id { get; set; }
        public string UsuarioId { get; set; }
        public UsuarioTDAH Usuario { get; set; } = null!;
        public DateTime Data { get; set; }
        public Humor Humor { get; set; }
        public int NivelFoco { get; set; } // 1 a 5
        public bool Ansiedade { get; set; }
        public string? Observacoes { get; set; }

        public RegistroDiario(string usuarioId, DateTime data, Humor humor, int nivelFoco, bool ansiedade, string? observacoes)
        {
            Id = Guid.NewGuid();
            UsuarioId = usuarioId;
            Data = data;
            Humor = humor;
            NivelFoco = nivelFoco;
            Ansiedade = ansiedade;
            Observacoes = observacoes;
        }

        protected RegistroDiario() { }

        public void Atualizar(Humor humor, int nivelFoco, bool ansiedade, string? observacoes)
        {
            Humor = humor;
            NivelFoco = nivelFoco;
            Ansiedade = ansiedade;
            Observacoes = observacoes;
        }
    }
}
