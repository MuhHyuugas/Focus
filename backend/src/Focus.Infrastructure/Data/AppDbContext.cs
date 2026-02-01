using Focus.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Focus.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<UsuarioTDAH> Usuarios { get; set; }
        public DbSet<Medicacao> Medicacoes { get; set; }
        public DbSet<Tratamento> Tratamentos { get; set; }
        public DbSet<Lembrete> Lembretes { get; set; }
        public DbSet<RegistroDiario> Diarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UsuarioTDAH>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired();
            });

            modelBuilder.Entity<Tratamento>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Usuario)
                    .WithMany()
                    .HasForeignKey(e => e.UsuarioId);
                entity.HasOne(e => e.Medicacao)
                    .WithMany()
                    .HasForeignKey(e => e.MedicacaoId);
            });

            modelBuilder.Entity<Lembrete>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Tratamento)
                    .WithMany()
                    .HasForeignKey(e => e.TratamentoId);
            });

            modelBuilder.Entity<RegistroDiario>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Usuario)
                    .WithMany()
                    .HasForeignKey(e => e.UsuarioId);
            });
        }
    }
}
