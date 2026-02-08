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
        public DbSet<RegistroDiario> Diarios { get; set; }
        public DbSet<DailyMark> DailyMarks { get; set; }
        public DbSet<DoseLog> DoseLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<DoseLog>(entity =>
            {
                entity.ToTable("dose_logs");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TratamentoId).HasColumnName("id_tratamento").IsRequired();
                entity.Property(e => e.HorarioPlano).HasColumnName("horario_plano").IsRequired();
                entity.Property(e => e.HorarioTomado).HasColumnName("horario_tomado").IsRequired();
                entity.Property(e => e.Humor).HasColumnName("humor");
                entity.Property(e => e.Ansiedade).HasColumnName("ansiedade").IsRequired();
                entity.Property(e => e.Foco).HasColumnName("foco");
                entity.Property(e => e.Notas).HasColumnName("notas");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Tratamento)
                    .WithMany()
                    .HasForeignKey(e => e.TratamentoId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UsuarioTDAH>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Nome).HasColumnName("nome").IsRequired();
                entity.Property(e => e.Email).HasColumnName("email").IsRequired();
                entity.Property(e => e.SenhaHash).HasColumnName("senha_hash");
                entity.Property(e => e.Telefone).HasColumnName("telefone");
                entity.Property(e => e.Avatar).HasColumnName("avatar");
                entity.Property(e => e.DataNascimento).HasColumnName("data_nascimento");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            });

            modelBuilder.Entity<Medicacao>(entity =>
            {
                entity.ToTable("medications");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Nome).HasColumnName("nome").IsRequired();
                entity.Property(e => e.DosagemPadrao).HasColumnName("dosagem_padrao");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            });

            modelBuilder.Entity<Tratamento>(entity =>
            {
                entity.ToTable("treatments");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UsuarioId).HasColumnName("id_usuario").IsRequired();
                entity.Property(e => e.MedicacaoId).HasColumnName("id_medicamento").IsRequired();
                entity.Property(e => e.Dose).HasColumnName("dose");
                entity.Property(e => e.Dias).HasColumnName("dias");
                entity.Property(e => e.Horarios).HasColumnName("horarios");
                entity.Property(e => e.Status).HasColumnName("status").HasDefaultValue("ativo");
                entity.Property(e => e.DataInicio).HasColumnName("data_inicio");
                entity.Property(e => e.DataFim).HasColumnName("data_fim");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Usuario)
                    .WithMany()
                    .HasForeignKey(e => e.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Medicacao)
                    .WithMany()
                    .HasForeignKey(e => e.MedicacaoId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<RegistroDiario>(entity =>
            {
                entity.ToTable("daily_records");
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Usuario)
                    .WithMany()
                    .HasForeignKey(e => e.UsuarioId);
            });

            modelBuilder.Entity<DailyMark>(entity =>
            {
                entity.ToTable("daily_marks");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UsuarioId).HasColumnName("id_usuario").IsRequired();
                entity.Property(e => e.Data).HasColumnName("data").IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Usuario)
                    .WithMany()
                    .HasForeignKey(e => e.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
