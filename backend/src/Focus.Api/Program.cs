using Focus.Application.UseCases.Usuarios;
using Focus.Domain.Repositories;
using Focus.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); 

builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddScoped<RegistrarUsuario>();

// 2. Construir o App
var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers(); 
app.Run();