from django.urls import path
from .views import SummarizeLinkView
from . import views

urlpatterns = [
    path('summarize-link/', SummarizeLinkView.as_view(), name='summarize-link'),
    path('get_saved_articles/', views.get_saved_articles, name='get_saved_articles'),
    path('add_article/', views.add_article, name='add_article'),
    path('delete_saved_article/', views.delete_saved_article, name='delete_saved_article'),
]
