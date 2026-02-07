export interface SideEffectType {
  id: string;
  name: string;
  description: string;
}

export const SIDE_EFFECT_TYPES: SideEffectType[] = [
  {
    id: "type-1",
    name: "Alterações de humor",
    description: "Mudanças repentinas de humor, irritabilidade ou ansiedade.",
  },
  {
    id: "type-2",
    name: "Alterações no foco",
    description: "Dificuldade de concentração ou hiperfoco.",
  },
  {
    id: "type-3",
    name: "Efeitos físicos",
    description: "Tontura, enjoo, dor de cabeça ou palpitações.",
  },
  {
    id: "type-4",
    name: "Alterações no sono",
    description: "Insônia, sonolência excessiva ou pesadelos.",
  },
  {
    id: "type-5",
    name: "Outros",
    description: "Outros efeitos não listados acima.",
  },
];
