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

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<Focus.Infrastructure.Data.AppDbContext>(options =>
    options.UseSqlite("Data Source=focus.db"));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<ITokenGenerator, TokenGenerator>();

builder.Services.AddScoped<RegistrarUsuario>();
builder.Services.AddScoped<LoginUsuario>();

builder.Services.AddScoped<IMedicacaoRepository, MedicacaoRepository>();
builder.Services.AddScoped<ITratamentoRepository, TratamentoRepository>();
builder.Services.AddScoped<ILembreteRepository, LembreteRepository>();
builder.Services.AddScoped<Focus.Application.UseCases.Tratamentos.CriarTratamento>();
builder.Services.AddScoped<Focus.Application.UseCases.Tratamentos.ObterLembretesDoUsuario>();
builder.Services.AddScoped<Focus.Application.UseCases.Tratamentos.MarcarLembreteComoTomado>();

builder.Services.AddScoped<IRegistroDiarioRepository, RegistroDiarioRepository>();
builder.Services.AddScoped<Focus.Application.UseCases.Diario.RegistrarDiario>();
builder.Services.AddScoped<Focus.Application.UseCases.Diario.ObterHistoricoDiario>();

var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Secret"] ?? "SuperSecretKeyForDevelopmentOnly123456");

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

// 2. Construir o App
var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();