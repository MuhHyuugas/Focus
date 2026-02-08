using Focus.Application.UseCases.DoseLogs;
using Microsoft.AspNetCore.Mvc;

namespace Focus.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoseLogsController(RegistrarDoseLog registrarDoseLog, ListarDoseLogs listarDoseLogs) : ControllerBase
    {
        private readonly RegistrarDoseLog _registrarDoseLog = registrarDoseLog;
        private readonly ListarDoseLogs _listarDoseLogs = listarDoseLogs;

        [HttpPost]
        public IActionResult Registrar([FromBody] RegistrarDoseLogRequest request)
        {
            try
            {
                if (!Guid.TryParse(request.TratamentoId, out var tratamentoGuid))
                    return BadRequest("ID do tratamento inválido");

                Guid? logGuid = null;
                if (!string.IsNullOrEmpty(request.Id) && Guid.TryParse(request.Id, out var parsedId))
                    logGuid = parsedId;

                _registrarDoseLog.Executar(
                    tratamentoGuid,
                    request.HorarioPlano,
                    request.HorarioTomado,
                    request.Notas,
                    logGuid
                );

                return Created(string.Empty, new { Message = "Log de dose registrado com sucesso." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpGet("usuario/{usuarioId}")]
        public IActionResult ListarPorUsuario(string usuarioId)
        {
            try
            {
                if (!Guid.TryParse(usuarioId, out var userGuid))
                    return BadRequest("ID do usuário inválido");

                var logs = _listarDoseLogs.ExecutarPorUsuario(userGuid);
                
                var response = logs.Select(l => new {
                    l.Id,
                    l.TratamentoId,
                    l.HorarioPlano,
                    l.HorarioTomado,
                    l.Notas
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }

    public record RegistrarDoseLogRequest(
        string TratamentoId,
        DateTime HorarioPlano,
        DateTime HorarioTomado,
        string? Notas,
        string? Id = null
    );
}
