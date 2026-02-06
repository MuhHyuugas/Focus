/*
 * Focus API - Program Entry Point
 * 
 * Responsabilidade: Configuração do pipeline da aplicação ASP.NET Core, 
 * injeção de dependências e definições de middleware.
 */

using Focus.Application.UseCases.Usuarios;
using Focus.Domain.Repositories;
using Focus.Domain.Security;
using Focus.Infrastructure.Repositories;
using Focus.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Configuração de Serviços do Framework ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- 2. Persistência de Dados (Infrastructure) ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<Focus.Infrastructure.Data.AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    ));

// --- 3. Repositórios (Dependency Injection) ---
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IMedicacaoRepository, MedicacaoRepository>();
builder.Services.AddScoped<ITratamentoRepository, TratamentoRepository>();
builder.Services.AddScoped<IRegistroDiarioRepository, RegistroDiarioRepository>();

// --- 4. Segurança e Criptografia ---
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<ITokenGenerator, TokenGenerator>();

// --- 5. Casos de Uso (Application Layer) ---
// Usuários
builder.Services.AddScoped<RegistrarUsuario>();
builder.Services.AddScoped<LoginUsuario>();

// Tratamentos
builder.Services.AddScoped<Focus.Application.UseCases.Tratamentos.CriarTratamento>();

// Diário
builder.Services.AddScoped<Focus.Application.UseCases.Diario.RegistrarDiario>();
builder.Services.AddScoped<Focus.Application.UseCases.Diario.ObterHistoricoDiario>();

// Medicações
builder.Services.AddScoped<Focus.Application.UseCases.Medicacoes.ListarMedicacoes>();

// --- 6. Autenticação JWT ---
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "SuperSecretKeyForDevelopmentOnly123456";
var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// --- 7. Construção e Pipeline de Middlewares ---
var app = builder.Build();

// Ambiente de Desenvolvimento
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Segurança: Autenticação deve vir antes de Autorização
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
