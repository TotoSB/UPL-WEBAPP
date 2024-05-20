from django import forms
from .models import Proyectos

class ProyectoForm(forms.Form):
    titulo_proyecto = forms.CharField(label="Titulo")
    descripcion = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 4, 'cols': 50}),
        label='Descipcion'  # Configura la etiqueta de esta manera
    )
    img = forms.ImageField(label="Portada de propuesta")

    class Meta:
        models = Proyectos
        fields = '__all__'
