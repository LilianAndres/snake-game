# snake-js



## Notre jeu

Nous avons développé ce jeu en binome : Joris GARCIA et Lilian ANDRES. L'application comporte 2 écrans :

- Un écran d'accueil présentant les différents niveaux (générés dynamiquement à partir du JSON)
- Un écran de jeu avec la grille correspondant au niveau séléctionné

Une fois le niveau séléctionné, on peut démarrer le jeu en cliquant sur une des flèches directionnelles du clavier.

Le but du jeu est de se déplacer pour aller récupérer les pommes en évitant les obstacles tels que les murs ou bien les rebords. Il ne faut pas non plus de manger la queue. Le serpent accélère progressivement en fonction du niveau choisi et les pommes peuvent disparaître à tout moment. Dépêchez-vous !

En cas de défaite, on peut choisir de recommencer le niveau ou bien de retourner à l'écran d'accueil.
A noter qu'il est possible de revenir à tout moment à l'écran d'accueil en cliquant sur le logo présent en haut de chaque page.

## Fonctionnalités & Extensions

:white_check_mark: Gestion des collisions <br>
:white_check_mark: Démarrage du jeu sur le clic "Flèches" <br>
:white_check_mark: Accélération progressive du serpent en fonction des niveaux <br>
:white_check_mark: Faire disparaître la nourriture au bout d'un certain temps pour la faire réapparaître ailleurs <br>
:white_check_mark: Intégrer des sons (ambiance sonore, effets lorsque l'on mange ou que l'on se cogne) <br>
:white_check_mark: Intégrer des images plutôt que des carrés monochromes <br>
:white_check_mark: Bouton de rédémarrage du niveau en cas de défaite <br>

:x: Changer le type de sol (nécessite un refonte complète de l'architecture du tableau 2D représentant le monde) <br>
:x: Mode multi-joueur <br>
:x: Changer le type de nourriture 
