from django.db import models
from django.contrib.auth.models import User


class Pregunta(models.Model):
    contenido = models.TextField()
    autor = models.ForeignKey(User, on_delete=models.CASCADE)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"@{self.autor.username}: {self.contenido}"

class Comentario(models.Model):
    contenido = models.TextField()
    pregunta = models.ForeignKey(Pregunta, on_delete=models.CASCADE)
    autor = models.ForeignKey(User, on_delete=models.CASCADE)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentario de {self.autor.username} en {self.pregunta.contenido}"



class Proyectos(models.Model):
    titulo = models.CharField(max_length=50)
    banner_img = models.ImageField(upload_to="media_img")
    descripcion = models.CharField(max_length=1900)
    fecha_creacion = models.DateTimeField()

    def __str__(self):
        return self.titulo
