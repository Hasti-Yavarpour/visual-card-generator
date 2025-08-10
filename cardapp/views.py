

from django.shortcuts import render

def credit_card(request):
    return render(request, 'cardapp/credit_card.html')

def driving_license(request):
    return render(request, 'cardapp/driving_license.html')
