from django.urls import path
from .views import SummarizeLinkView

urlpatterns = [
    path('summarize-link/', SummarizeLinkView.as_view(), name='summarize-link'),
]
