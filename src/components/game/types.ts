/** Une commande du menu de l'écran de jeu. */
export interface Command {
  id: string;
  label: string;
  disabled?: boolean;
}
