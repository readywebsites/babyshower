from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('api/poll', views.poll_api, name='api_poll'),
    path('api/wishes', views.wishes_api, name='api_wishes'),
    path('api/wishes/<int:wish_id>/like', views.wish_like_api, name='api_wish_like'),
    path('api/rsvps', views.rsvp_api, name='api_rsvps'),
]
