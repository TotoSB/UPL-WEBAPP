import requests
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from .models import Pregunta, Comentario
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Group


# Create your views here.

@login_required
def profile(request):
    usuario = request.user

    # Contar preguntas y comentarios del usuario
    total_preguntas = Pregunta.objects.filter(autor=usuario).count()
    total_respuestas = Comentario.objects.filter(autor=usuario).count()

    return render(request, "profile.html", {
        "data": usuario,
        "email": usuario.email,
        "total_preguntas": total_preguntas,
        "total_respuestas": total_respuestas,
    })

def unlogin(request):
    logout(request)
    return render(request, "index.html")


def inicio(request):
    # Foro
    preguntas = Pregunta.objects.all().order_by('-fecha_creacion')
    respuestas = Comentario.objects.all()
    if request.method == 'POST':
        if 'pregunta' in request.POST:
            pregunta = request.POST['pregunta']
            redactor = request.user
            pregunta_obj = Pregunta.objects.create(contenido=pregunta, autor=redactor)
            pregunta_obj.save()
            return redirect('home')
        elif 'respuesta' in request.POST:
            comentario = request.POST['respuesta']
            pregunta_id = request.POST['pregunta_id']
            pregunta_obj = Pregunta.objects.get(id=pregunta_id)
            redactor = request.user
            comentario_obj = Comentario.objects.create(contenido=comentario, pregunta=pregunta_obj, autor=redactor)
            comentario_obj.save()
            return redirect('home')
    return render(request, "index.html", {"preguntas": preguntas})

def registro(request):
    if request.method == 'POST':
        nombre_usuario = request.POST['username']
        email_usuario = request.POST['email']
        contrasena1 = request.POST['password1']
        contrasena2 = request.POST['password2']
        grupo_seleccionado = request.POST.get('user_type')

        if contrasena1 != contrasena2:
            messages.error(request, "Las contraseñas no coinciden.")
            return redirect('registro')

        user = User.objects.create_user(
            username=nombre_usuario,
            email=email_usuario,
            password=contrasena1
        )

        if grupo_seleccionado:
            group, created = Group.objects.get_or_create(name=grupo_seleccionado)
            user.groups.add(group)

        user.save()
        login(request, user)
        return redirect('home')

    return render(request, "registro.html")


def sign_in(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'¡Bienvenido {username}!')
                return redirect('home')
            else:
                messages.error(request, 'Nombre de usuario o contraseña incorrectos.')
        else:
            messages.error(request, 'Nombre de usuario o contraseña incorrectos.')
    else:
        form = AuthenticationForm()

    return render(request, 'login.html', {'form': form})

