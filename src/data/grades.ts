export interface Grade {
  id: string;
  name: string;
  /** Niveau à partir duquel ce grade est atteint. */
  minLevel: number;
  /** Couleur de l'anneau de l'avatar et du badge de grade. */
  color: string;
}

/** Grades, du plus bas au plus haut. Les noms et les seuils se règlent ici. */
export const GRADES: Grade[] = [
  { id: 'debutant', name: 'Débutant', minLevel: 1, color: '#9fbdb3' },
  { id: 'perseverant', name: 'Persévérant', minLevel: 3, color: '#2ecc9a' },
  { id: 'assidu', name: 'Assidu', minLevel: 6, color: '#4fc3f7' },
  { id: 'devoue', name: 'Dévoué', minLevel: 10, color: '#a78bfa' },
  { id: 'constant', name: 'Constant', minLevel: 15, color: '#f2c94c' },
  { id: 'exemplaire', name: 'Exemplaire', minLevel: 25, color: '#ff9f43' },
  { id: 'lumiere', name: 'Lumière', minLevel: 40, color: '#ffe08a' },
];

/** Grade correspondant à un niveau. */
export function gradeForLevel(level: number): Grade {
  let current = GRADES[0];
  for (const grade of GRADES) if (level >= grade.minLevel) current = grade;
  return current;
}

/** Prochain grade à atteindre, ou `null` au grade maximal. */
export function nextGrade(level: number): Grade | null {
  return GRADES.find((g) => g.minLevel > level) ?? null;
}
