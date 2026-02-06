using System;
using Focus.Application.UseCases.Tratamentos;
using Microsoft.AspNetCore.Mvc;

namespace Focus.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TratamentosController(
        CriarTratamento criarTratamento) : ControllerBase
    {
        private readonly CriarTratamento _criarTratamento = criarTratamento;

        [HttpPost]
        public IActionResult Criar([FromBody] CriarTratamentoRequest request)
        {
            try
            {
                _criarTratamento.Executar(
                    request.UsuarioId,
                    request.NomeMedicamento,
                    request.Dosagem,
                    request.Dias,
                    request.Horarios
                );

                return Created(string.Empty, new { Message = "Tratamento criado com sucesso." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // ... methods ...

    }

    public record CriarTratamentoRequest(
        string UsuarioId,
        string NomeMedicamento,
        string Dosagem,
        string Dias,
        string Horarios
    );
}
