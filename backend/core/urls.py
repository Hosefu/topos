from django.urls import path
from .views import OfficeStatsView

urlpatterns = [
    path('stats/', OfficeStatsView.as_view(), name='office-stats'),
]