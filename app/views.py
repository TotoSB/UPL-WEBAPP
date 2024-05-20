
import requests
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from .forms import ProyectoForm
from .models import Proyectos, Pregunta, Comentario
from django.contrib.auth.models import Group


# Create your views here.
def inicio(request):
    # Foro
    preguntas = Pregunta.objects.all()
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
    if request.method =='POST':
        nombre_usuario = request.POST['username']
        email_usuario = request.POST['email']
        contasena_usuario = request.POST['password']
        user = User.objects.create_user(nombre_usuario, email_usuario, contasena_usuario)
        grupo_seleccionado = request.POST['grupo']
        if grupo_seleccionado:
                group = Group.objects.get(name=grupo_seleccionado)
                user.groups.add(group)
        user.save()
        login(request, user)
        return redirect(to="home")
    return render(request, "registro.html")

def unlogin(request):
    logout(request)
    return render(request, "index.html")

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
                    return redirect('home')  # Cambia 'home' por la URL a la que quieras redirigir después de iniciar sesión
                else:
                    messages.error(request, 'Nombre de usuario o contraseña incorrectos.')
            else:
                messages.error(request, 'Formulario inválido.')
                return redirect("login")
    else:
            form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})

def add_propuesta(request):
    context = {}
    if request.method =='POST':
        form = ProyectoForm(request.POST, request.FILES)
        if form.is_valid():  
            titulo_prop = request.POST['titulo_proyecto']
            desc_prop = request.POST['descripcion']
            imagen = form.cleaned_data.get('img')
            obj = Proyectos.objects.create(titulo=titulo_prop, descripcion=desc_prop, banner_img=imagen)
            obj.save()

            return redirect('home')
    else:  
        form = ProyectoForm()  
        context['form']= form

    return render(request, "admin/crear_propuesta.html", context)

def propuestas(request):
    propuestas_listadas = Proyectos.objects.all()
    return render(request, "propuestas.html", {"propuestas" : propuestas_listadas})

def profile(request):
    usuario = User()
    email = User.email
    return render(request, "profile.html", {"data": usuario, "email": email})