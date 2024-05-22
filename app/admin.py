from django.contrib import admin
from .models import Proyectos, Pregunta, Comentario

# Register your models here.
admin.site.register(Proyectos)
admin.site.register(Pregunta)
admin.site.register(Comentario)