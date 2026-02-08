using Focus.Application.UseCases.SideEffects;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace Focus.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SideEffectsController(RegistrarSideEffect registrarSideEffect, ListarSideEffects listarSideEffects) : ControllerBase
    {
        private readonly RegistrarSideEffect _registrarSideEffect = registrarSideEffect;
        private readonly ListarSideEffects _listarSideEffects = listarSideEffects;

        [HttpPost]
        public IActionResult Registrar([FromBody] RegistrarSideEffectRequest request)
        {
            try
            {
                if (!Guid.TryParse(request.TratamentoId, out var tratamentoGuid))
                    return BadRequest("ID do tratamento inválido");

                Guid? sideEffectGuid = null;
                if (!string.IsNullOrEmpty(request.Id) && Guid.TryParse(request.Id, out var parsedId))
                    sideEffectGuid = parsedId;

                _registrarSideEffect.Executar(
                    tratamentoGuid,
                    request.TipoId,
                    request.Descricao,
                    request.Data,
                    request.Humor,
                    request.Ansiedade,
                    request.Foco,
                    request.Notas,
                    sideEffectGuid
                );

                return Created(string.Empty, new { Message = "Efeito colateral registrado com sucesso." });
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

                var effects = _listarSideEffects.Executar(userGuid);
                
                var response = effects.Select(e => new {
                    e.Id,
                    e.TratamentoId,
                    e.TipoId,
                    e.Descricao,
                    e.Data,
                    e.Humor,
                    e.Ansiedade,
                    e.Foco,
                    e.Notas
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }

    public record RegistrarSideEffectRequest(
        string TratamentoId,
        string TipoId,
        string Descricao,
        DateTime Data,
        int? Humor,
        bool Ansiedade,
        int? Foco,
        string? Notas,
        string? Id = null
    );
}
