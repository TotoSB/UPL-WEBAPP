from django.contrib import admin
from .models import Pregunta, Comentario

# Register your models here.
admin.site.register(Pregunta)
admin.site.register(Comentario)