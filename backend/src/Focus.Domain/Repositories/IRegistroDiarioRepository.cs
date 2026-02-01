using System;
using System.Collections.Generic;
using Focus.Domain.Entities;

namespace Focus.Domain.Repositories
{
    public interface IRegistroDiarioRepository
    {
        void Adicionar(RegistroDiario registro);
        void Atualizar(RegistroDiario registro);
        RegistroDiario? BuscarPorUsuarioEData(string usuarioId, DateTime data);
        List<RegistroDiario> BuscarHistorico(string usuarioId, int dias);
    }
}
