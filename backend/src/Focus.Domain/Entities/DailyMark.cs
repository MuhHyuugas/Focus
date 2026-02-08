using System;

namespace Focus.Domain.Entities
{
    public class DailyMark
    {
        public Guid Id { get; set; }
        public Guid UsuarioId { get; set; }
        public DateTime Data { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public virtual UsuarioTDAH? Usuario { get; set; }

        public DailyMark(Guid id, Guid usuarioId, DateTime data)
        {
            Id = id;
            UsuarioId = usuarioId;
            Data = data;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        protected DailyMark() { }
    }
}
