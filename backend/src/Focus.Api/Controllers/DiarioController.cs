using System;
using Focus.Application.UseCases.Diario;
using Focus.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Focus.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiarioController(
        RegistrarDiario registrarDiario,
        ObterHistoricoDiario obterHistoricoDiario) : ControllerBase
    {
        private readonly RegistrarDiario _registrarDiario = registrarDiario;
        private readonly ObterHistoricoDiario _obterHistoricoDiario = obterHistoricoDiario;

        [HttpPost]
        public IActionResult Registrar([FromBody] RegistrarDiarioRequest request)
        {
            try
            {
                _registrarDiario.Executar(
                    request.UsuarioId,
                    (Humor)request.Humor,
                    request.NivelFoco,
                    request.Ansiedade,
                    request.Observacoes
                );

                return Ok(new { Message = "Registro diário salvo com sucesso." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpGet]
        public IActionResult ObterHistorico([FromQuery] string usuarioId, [FromQuery] int dias = 30)
        {
            try
            {
                var historico = _obterHistoricoDiario.Executar(usuarioId, dias);
                return Ok(historico);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }

    public record RegistrarDiarioRequest(
        string UsuarioId,
        int Humor,
        int NivelFoco,
        bool Ansiedade,
        string? Observacoes
    );
}
