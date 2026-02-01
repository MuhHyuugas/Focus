using System;
using Focus.Application.UseCases.Tratamentos;
using Microsoft.AspNetCore.Mvc;

namespace Focus.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TratamentosController(
        CriarTratamento criarTratamento,
        ObterLembretesDoUsuario obterLembretesDoUsuario,
        MarcarLembreteComoTomado marcarLembreteComoTomado) : ControllerBase
    {
        private readonly CriarTratamento _criarTratamento = criarTratamento;
        private readonly ObterLembretesDoUsuario _obterLembretesDoUsuario = obterLembretesDoUsuario;
        private readonly MarcarLembreteComoTomado _marcarLembreteComoTomado = marcarLembreteComoTomado;

        [HttpPost]
        public IActionResult Criar([FromBody] CriarTratamentoRequest request)
        {
            try
            {
                _criarTratamento.Executar(
                    request.UsuarioId,
                    request.NomeMedicamento,
                    request.Dosagem,
                    request.HorarioInicio,
                    request.IntervaloHoras
                );

                return Created(string.Empty, new { Message = "Tratamento criado com sucesso." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpGet("lembretes")]
        public IActionResult ObterLembretes([FromQuery] string usuarioId, [FromQuery] DateTime? data = null)
        {
            try
            {
                var lembretes = _obterLembretesDoUsuario.Executar(usuarioId, data);
                return Ok(lembretes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPut("lembretes/{id}/tomar")]
        public IActionResult MarcarComoTomado(Guid id)
        {
            try
            {
                _marcarLembreteComoTomado.Executar(id);
                return Ok(new { Message = "Lembrete marcado como tomado." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }

    public record CriarTratamentoRequest(
        string UsuarioId,
        string NomeMedicamento,
        string Dosagem,
        DateTime HorarioInicio,
        int IntervaloHoras
    );
}
