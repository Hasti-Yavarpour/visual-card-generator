from django.urls import path
from . import views

urlpatterns = [
    path('credit-card/', views.credit_card, name='credit_card'),
    path('driving-license/', views.driving_license, name='driving_license'),
]
