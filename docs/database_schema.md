# Linka - database

## Base de datos

### Tabla Usuarios

-   id
-   email
-   password
-   username
-   bio
-   avatar
-   url_site
-   url_instagram
-   url_twitter
-   fecha_registro
-   fecha_modificacion
-   active (?)

### Tabla publicaciones

-   id
-   titulo
-   descripcion_usuario
-   image_prev (?)
-   text_prev (?)
-   tags
-   visitas
-   likes
-   fecha_modificacion
-   fecha_creacion
-   id_usuario

### Tabla comentarios

-   id
-   text
-   fecha_creacion
-   id_usuario
-   id_post

## Backend (API)

### API Usuarios

-   registrarse (crear usuario) 🆗
-   confirmar cuenta
-   ver información de un usuario 🆗
-   editar datos del usuario 🆗
-   borrar/desactivar usuario 🆗
-   hacer login 🆗
-   recuperar contraseña
-   ver actividad reciente 🆗

#### Registrarse (crear usuario):

-   Método: POST
-   URL: `/api/users`
-   Token: No
-   Body:
    -   nombre_completo
    -   email
    -   password
    -   password_repetida

#### Ver los usuarios que hay:

-   Método: GET
-   URL: `/api/users?page=3&search=ber`
-   Token: Opcional
-   QueryString:
    -   page?
    -   search?
    -   ...
-   Devuelve:
    -   Array con información de los usuarios:
        -   id
        -   nombre_completo
        -   fecha_registro
        -   total_imagenes
        -   avatar

#### Ver información usuario:

-   Método: GET
-   URL: `/api/users/:id`
-   Token: Opcional
-   Devuelve:
    -   id
    -   username
    -   fecha_registro
    -   publicaciones
    -   avatar
    -   bio
    -   redes/site

#### Editar datos de un usuario:

-   Método: PUT / PATCH
-   URL: `/api/users/:id`
-   Token: Si (el token del usuario que estoy editando)
-   Body:
    -   email
    -   password
    -   biografia
    -   avatar
    -   redes/site

#### Borrar un Usuario:

-   Método: DELETE
-   URL: `/api/users/:id`
-   Token: Si (el token del usuario que estoy borrando)
-   Devuelve: Id de usuario

#### Login:

-   Método: POST
-   URL: `/api/users/login`
-   Token: No
-   Body:
    -   email
    -   password
-   Devuelve: token

#### Recuperar contraseña:

-   Método: POST
-   URL: `/api/users/recover-password`
-   Token: No
-   Body:
    -   email

### API publicaciones

-   listar publicaciones
-   crear imagenes
-   ver datos una imagen
-   editar datos de imagen
-   borrar imagen
-   ver últimas publicaciones visitadas 🆗

#### Listar imagenes:

-   Ejemplos:
    _/api/images
    /api/images?sort=new (igual que el anterior)
    /api/images?sort=top
    /api/images?user=33&sort=top_
-   Método: GET
-   URL: `/api/images`
-   Token: opcional
-   Querystring (ver ejemplos)
-   Devuelve:
    -   Array de información de imagen:
        -   id
        -   titulo
        -   descripcion
        -   fichero
        -   usuario: (haciendo JOIN)
        -   id
        -   nombre_completo
        -   fecha_creacion
        -   count_comentarios

#### Ver últimas publicaciones visitadas por usuario:

-   Método: GET
-   URL: `/api/posts/:userId`
-   Token: opcional
-   Querystring (ver ejemplos)
-   Devuelve:
    -   Array de información de imagen:
        -   id
        -   titulo
        -   descripcion
        -   fichero
        -   usuario: (haciendo JOIN)
        -   id
        -   nombre_completo
        -   fecha_creacion
        -   count_comentarios

#### Crear imágenes:

-   Método: POST
-   URL: `/api/images`
-   Token: Si
-   Body:
    -   titulo
    -   descripcion?
    -   fichero (binario)
    -   id_usuario (sacada del token)

#### Ver datos de una imagen:

-   Método: GET
-   URL: `/api/images/:id`
-   Token: opcional
-   Devuelve:
    -   id
    -   titulo
    -   descripcion
    -   fecha_creacion
    -   fichero
    -   usuario:
        -   id
        -   nombre_completo
    -   visitas

#### Editar datos de una imagen:

-   Método: PUT / PATCH
-   URL: `/api/images/:id`
-   Token: Si (el del usuario que creó la imagen)
-   Body:
    -   titulo
    -   descripcion?
    -   fichero (binario)

#### Borrar imagen:

-   Método: DELETE
-   URL: `/api/images/:id`
-   Token: Si (el del usuario que creó la imagen)
-   Devuelve: id de la imagen

### API Comentarios

-   listar comentarios de imagen ✅
-   crear comentario ✅
-   borrar comentario ✅

#### Listar comentarios de una imagen:

-   Método: GET
-   URL: `/api/images/:id/comments`
-   Token: Opcional
-   Devuelve:
    -   texto
    -   usuario:
    -   id
    -   nombre_completo
    -   fecha_creacion

#### Crear comentarios:

-   Método: POST
-   URL: `/api/images/:id/comments`
-   Token: Si
-   Body:
    -   texto
    -   id_usuario (no va estrictamente en el body, se saca del token)
    -   id_imagen (no va estrictamente en el body, se saca de la url)

#### Borrar comentario:

-   Método: DELETE
-   URL: `/api/images/:id/comments/:id_comment`
-   Token: Si (el del usuario que escribió el comment)
-   Devuelve: id del comentario (opcionalmente)
