from django.urls import path, include
from .views import inicio, registro, add_propuesta, propuestas, sign_in, unlogin, profile

urlpatterns = [
    path('', inicio, name="home"),
    path('register', registro, name="registro"),
    path("logout", unlogin, name="cerrar"),
    path('accounts/', include('django.contrib.auth.urls')),
    path('crear_propuesta', add_propuesta, name="crear_propuesta"),
    path('propuestas', propuestas, name="propuestas"),
    path('login/', sign_in, name="logear"),
    path('mis_datos', profile, name="profile"),
]