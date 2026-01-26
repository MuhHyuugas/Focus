using System;
using Focus.Infrastructure.Repositories;
using Focus.Application.UseCases.Usuarios;
using Focus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseSqlite("Data Source=app.db")
    .Options;
var context = new AppDbContext(options);
var repositorio = new UserRepository(context);
var registrarUsuario = new RegistrarUsuario(repositorio);

Console.WriteLine("=== BEM-VINDO AO FOCUS ===");

while (true)
{
    Console.WriteLine("\n--- Novo Cadastro ---");

    Console.Write("Digite o Nome: ");
    var nome = Console.ReadLine();

    Console.Write("Digite o Email: ");
    var email = Console.ReadLine();

    Console.Write("Digite a Senha: ");
    var senha = Console.ReadLine();

    Console.Write("Digite a Data (aaaa-mm-dd): ");
    var dataTexto = Console.ReadLine();
    var dataNascimento = DateTime.Parse(dataTexto);

    try
    {
        registrarUsuario.Executar(nome, email, senha, dataNascimento);
        Console.WriteLine(" SUCESSO! Usuário cadastrado.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($" ERRO: {ex.Message}");
    }


    Console.Write("\nDeseja cadastrar outro usuário? (s/n): ");
    var resposta = Console.ReadLine();


    if (resposta == "n")
    {
        break;
    }


}