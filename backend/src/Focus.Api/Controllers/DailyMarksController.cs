using System;
using Focus.Application.UseCases.DailyMarks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Focus.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DailyMarksController(
        RegistrarDailyMark registrarDailyMark,
        ListarDailyMarks listarDailyMarks) : ControllerBase
    {
        private readonly RegistrarDailyMark _registrarDailyMark = registrarDailyMark;
        private readonly ListarDailyMarks _listarDailyMarks = listarDailyMarks;

        [HttpPost]
        public IActionResult Registrar([FromBody] RegistrarDailyMarkRequest request)
        {
            try
            {
                if (!Guid.TryParse(request.UsuarioId, out var userGuid))
                    return BadRequest("ID do usuário inválido");

                var markId = string.IsNullOrEmpty(request.Id) ? Guid.NewGuid() : Guid.Parse(request.Id);

                _registrarDailyMark.Executar(markId, userGuid, request.Data);
                return Created(string.Empty, new { Message = "Marcação diária registrada com sucesso." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpGet]
        public IActionResult Listar([FromQuery] string usuarioId)
        {
            try
            {
                if (!Guid.TryParse(usuarioId, out var userGuid))
                    return BadRequest("ID do usuário inválido");

                var marks = _listarDailyMarks.Executar(userGuid);
                return Ok(marks);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }

    public record RegistrarDailyMarkRequest(
        string? Id,
        string UsuarioId,
        DateTime Data
    );
}
